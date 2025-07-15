import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Layout, Widget } from "../../../../generated/graphql";
import FooterPanel from "../FooterPanel";

describe("FooterPanel", () => {
  const mockWidget: Partial<Widget> = {
    id: "1",
    displayFooter: true,
    footerText: "Sample footer text",
    __typename: "Widget",
    banners: [],
    createdAt: new Date().toISOString(),
    displayDishDetailsLink: true,
    displayFeedbackButton: true,
    displayGiveFeedbackBanner: true,
    displayImages: true,
    displayIngredients: true,
    displayMacronutrients: true,
    displayNavbar: true,
    displayNotifyMeBanner: true,
    displayNutrientPreferences: true,
    displaySoftSignUp: true,
    htmlTitleText: "Test Widget",
    isActive: true,
    isByoEnabled: true,
    isOrderButtonEnabled: true,
    isSyncEnabled: true,
    lastSyncedAt: new Date().toISOString(),
    layout: Layout.Card,
    supportedAllergens: [],
    supportedDietaryPreferences: [],
    updatedAt: new Date().toISOString(),
    usePagination: true,
  };

  const defaultProps = {
    widget: mockWidget as Widget,
    onFieldChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with all elements", () => {
    render(<FooterPanel {...defaultProps} />);

    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(
      screen.getByText("Display custom text at the bottom of the SmartMenu.")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Footer text")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should render the PanelBottom icon", () => {
    render(<FooterPanel {...defaultProps} />);

    const icon = document.querySelector("svg[aria-hidden='true']");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("should render with footer enabled and text", () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    const input = screen.getByPlaceholderText("Footer text");

    expect(toggle).toBeChecked();
    expect(input).toHaveValue("Sample footer text");
  });

  it("should render with footer disabled and no text input", () => {
    const widgetWithDisabledFooter: Partial<Widget> = {
      ...mockWidget,
      displayFooter: false,
      footerText: null,
    };

    render(
      <FooterPanel
        {...defaultProps}
        widget={widgetWithDisabledFooter as Widget}
      />
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).not.toBeChecked();
    expect(
      screen.queryByPlaceholderText("Footer text")
    ).not.toBeInTheDocument();
  });

  it("should call onFieldChange when toggle is clicked", async () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        displayFooter: false,
      });
    });
  });

  it("should call onFieldChange when text is changed", async () => {
    render(<FooterPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText("Footer text");
    fireEvent.change(input, { target: { value: "New footer text" } });

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        footerText: "New footer text",
      });
    });
  });

  it("should call onFieldChange with both changes when both are modified", async () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    const input = screen.getByPlaceholderText("Footer text");

    fireEvent.click(toggle);
    fireEvent.change(input, { target: { value: "Updated text" } });

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        displayFooter: false,
      });
    });
  });

  it("should handle empty text input", async () => {
    render(<FooterPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText("Footer text");
    fireEvent.change(input, { target: { value: "" } });

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        footerText: "",
      });
    });
  });

  it("should handle text input with max length", () => {
    render(<FooterPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveAttribute("maxLength", "120");
  });

  it("should apply correct CSS classes", () => {
    render(<FooterPanel {...defaultProps} />);

    const section = screen.getByTestId("footer-panel");
    expect(section).toHaveClass("space-y-6");

    const card = screen.getByText("Footer").closest(".rounded-lg");
    expect(card).toHaveClass(
      "space-y-2",
      "flex",
      "items-start",
      "justify-between"
    );

    const iconContainer = screen.getByText("Footer").closest("p");
    expect(iconContainer).toHaveClass(
      "flex",
      "items-center",
      "gap-2",
      "text-sm",
      "font-medium"
    );
  });

  it("should render with correct structure", () => {
    render(<FooterPanel {...defaultProps} />);

    const section = screen.getByTestId("footer-panel");
    expect(section).toBeInTheDocument();

    const card = section.querySelector(".p-4");
    expect(card).toBeInTheDocument();

    const leftContent = card?.querySelector(".flex-1");
    expect(leftContent).toBeInTheDocument();
    expect(leftContent).toHaveClass("space-y-2", "pr-4");
  });

  it("should render description text", () => {
    render(<FooterPanel {...defaultProps} />);

    const description = screen.getByText(
      "Display custom text at the bottom of the SmartMenu."
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("should render input only when footer is enabled", () => {
    const widgetWithDisabledFooter: Partial<Widget> = {
      ...mockWidget,
      displayFooter: false,
    };

    render(
      <FooterPanel
        {...defaultProps}
        widget={widgetWithDisabledFooter as Widget}
      />
    );

    expect(
      screen.queryByPlaceholderText("Footer text")
    ).not.toBeInTheDocument();
  });

  it("should render input when footer is enabled", () => {
    render(<FooterPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("w-full");
  });

  it("should handle toggle disabled state", () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).not.toBeDisabled();
  });

  it("should maintain accessibility attributes", () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-label", "Display footer");
  });

  it("should handle widget with null footerText", () => {
    const widgetWithNullText: Partial<Widget> = {
      ...mockWidget,
      footerText: null,
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithNullText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue("");
  });

  it("should handle widget with undefined footerText", () => {
    const widgetWithUndefinedText: Partial<Widget> = {
      ...mockWidget,
      footerText: undefined,
    };

    render(
      <FooterPanel
        {...defaultProps}
        widget={widgetWithUndefinedText as Widget}
      />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue("");
  });

  it("should handle widget with empty string footerText", () => {
    const widgetWithEmptyText: Partial<Widget> = {
      ...mockWidget,
      footerText: "",
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithEmptyText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue("");
  });

  it("should call onFieldChange with correct changes when enabling footer", async () => {
    const widgetWithDisabledFooter: Partial<Widget> = {
      ...mockWidget,
      displayFooter: false,
    };

    render(
      <FooterPanel
        {...defaultProps}
        widget={widgetWithDisabledFooter as Widget}
      />
    );

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        displayFooter: true,
      });
    });
  });

  it("should call onFieldChange with correct changes when disabling footer", async () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        displayFooter: false,
      });
    });
  });

  it("should handle rapid text changes", async () => {
    render(<FooterPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText("Footer text");

    fireEvent.change(input, { target: { value: "First change" } });
    fireEvent.change(input, { target: { value: "Second change" } });
    fireEvent.change(input, { target: { value: "Final change" } });

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        footerText: "Final change",
      });
    });
  });

  it("should handle rapid toggle changes", async () => {
    render(<FooterPanel {...defaultProps} />);

    const toggle = screen.getByRole("switch");

    fireEvent.click(toggle); // Disable
    fireEvent.click(toggle); // Enable
    fireEvent.click(toggle); // Disable again

    await waitFor(() => {
      expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
        displayFooter: false,
      });
    });
  });

  it("should handle widget with missing properties", () => {
    const minimalWidget: Partial<Widget> = {
      id: "1",
      __typename: "Widget",
      banners: [],
      createdAt: new Date().toISOString(),
      displayDishDetailsLink: true,
      displayFeedbackButton: true,
      displayFooter: false,
      displayGiveFeedbackBanner: true,
      displayImages: true,
      displayIngredients: true,
      displayMacronutrients: true,
      displayNavbar: true,
      displayNotifyMeBanner: true,
      displayNutrientPreferences: true,
      displaySoftSignUp: true,
      footerText: null,
      htmlTitleText: "Test Widget",
      isActive: true,
      isByoEnabled: true,
      isOrderButtonEnabled: true,
      isSyncEnabled: true,
      lastSyncedAt: new Date().toISOString(),
      layout: Layout.Card,
      supportedAllergens: [],
      supportedDietaryPreferences: [],
      updatedAt: new Date().toISOString(),
      usePagination: true,
    };

    render(<FooterPanel {...defaultProps} widget={minimalWidget as Widget} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).not.toBeChecked();
    expect(
      screen.queryByPlaceholderText("Footer text")
    ).not.toBeInTheDocument();
  });

  it("should handle widget with boolean footerText", () => {
    const widgetWithBooleanText: Partial<Widget> = {
      ...mockWidget,
      footerText: "true",
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithBooleanText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue("true");
  });

  it("should handle widget with number footerText", () => {
    const widgetWithNumberText: Partial<Widget> = {
      ...mockWidget,
      footerText: "123",
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithNumberText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue("123");
  });

  it("should render with correct spacing between elements", () => {
    render(<FooterPanel {...defaultProps} />);

    const card = screen.getByText("Footer").closest(".p-4");
    const leftContent = card?.querySelector(".flex-1");
    const toggle = screen.getByRole("switch");

    expect(leftContent).toHaveClass("pr-4");
    expect(toggle).toBeInTheDocument();
  });

  it("should handle long footer text", async () => {
    const longText = "A".repeat(150);
    const widgetWithLongText: Partial<Widget> = {
      ...mockWidget,
      footerText: longText,
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithLongText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue(longText);
    expect(input).toHaveAttribute("maxLength", "120");
  });

  it("should handle special characters in footer text", async () => {
    const specialText = "Footer with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?";
    const widgetWithSpecialText: Partial<Widget> = {
      ...mockWidget,
      footerText: specialText,
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithSpecialText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue(specialText);
  });

  it("should handle unicode characters in footer text", async () => {
    const unicodeText = "Footer with unicode: 🚀🌟🎉";
    const widgetWithUnicodeText: Partial<Widget> = {
      ...mockWidget,
      footerText: unicodeText,
    };

    render(
      <FooterPanel {...defaultProps} widget={widgetWithUnicodeText as Widget} />
    );

    const input = screen.getByPlaceholderText("Footer text");
    expect(input).toHaveValue(unicodeText);
  });
});
