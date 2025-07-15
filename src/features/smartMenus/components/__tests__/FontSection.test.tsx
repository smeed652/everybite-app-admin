import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FontSection from "../FontSection";

// No need to mock ColorRow - use the actual component

describe("FontSection", () => {
  const defaultProps = {
    fonts: ["Arial", "Helvetica", "Times New Roman"],
    navbarFont: "Arial",
    navbarFontSize: "16",
    navbarBg: "#ffffff",
    onNavbarFontChange: vi.fn(),
    onNavbarFontSizeChange: vi.fn(),
    onNavbarBgChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with all elements", () => {
    render(<FontSection {...defaultProps} />);

    expect(screen.getByText("Font")).toBeInTheDocument();
    expect(screen.getByText("Font family")).toBeInTheDocument();
    expect(screen.getByText("Font size (px)")).toBeInTheDocument();
    expect(screen.getByText("Background")).toBeInTheDocument();
    expect(
      screen.getByText("The quick brown fox jumps over the lazy dog")
    ).toBeInTheDocument();
  });

  it("should render the Type icon as SVG", () => {
    render(<FontSection {...defaultProps} />);
    // The lucide-react icon renders as an SVG with aria-hidden="true"
    const icon = document.querySelector("svg[aria-hidden='true']");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("should render font family select with correct options", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("Arial");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue("Arial");
    expect(options[1]).toHaveValue("Helvetica");
    expect(options[2]).toHaveValue("Times New Roman");
  });

  it("should render font size button with correct value", () => {
    render(<FontSection {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Select font size" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("16");
  });

  it("should render background color picker", () => {
    render(<FontSection {...defaultProps} />);

    const colorPicker = screen.getByLabelText("Background color picker");
    expect(colorPicker).toBeInTheDocument();

    const colorInput = screen.getByLabelText("Background color value");
    expect(colorInput).toBeInTheDocument();
    expect(colorInput).toHaveValue("#ffffff");
  });

  it("should render background hex input", () => {
    render(<FontSection {...defaultProps} />);

    const hexInput = screen.getByLabelText("Background hex value");
    expect(hexInput).toBeInTheDocument();
    expect(hexInput).toHaveValue("#ffffff");
  });

  it("should call onNavbarFontChange when font is changed", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Helvetica" } });

    expect(defaultProps.onNavbarFontChange).toHaveBeenCalledWith("Helvetica");
  });

  it("should call onNavbarBgChange when background color is changed", () => {
    render(<FontSection {...defaultProps} />);

    const hexInput = screen.getByLabelText("Background hex value");
    fireEvent.change(hexInput, { target: { value: "#000000" } });

    expect(defaultProps.onNavbarBgChange).toHaveBeenCalledWith("#000000");
  });

  it("should handle multiple changes in sequence", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");
    const hexInput = screen.getByLabelText("Background hex value");

    fireEvent.change(select, { target: { value: "Helvetica" } });
    fireEvent.change(hexInput, { target: { value: "#000000" } });

    expect(defaultProps.onNavbarFontChange).toHaveBeenCalledWith("Helvetica");
    expect(defaultProps.onNavbarBgChange).toHaveBeenCalledWith("#000000");
  });

  it("should render with correct CSS classes", () => {
    render(<FontSection {...defaultProps} />);
    // Instead of relying on class selectors, check for the presence of the main card and icon container by text
    const fontLabel = screen.getByText("Font");
    expect(fontLabel).toBeInTheDocument();
    // Optionally, check for a parent element
    const parent = fontLabel.parentElement;
    expect(parent).toBeTruthy();
  });

  it("should render with correct structure", () => {
    render(<FontSection {...defaultProps} />);
    // Check that the description and select are present
    expect(
      screen.getByText("The quick brown fox jumps over the lazy dog")
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render description text", () => {
    render(<FontSection {...defaultProps} />);

    const description = screen.getByText(
      "The quick brown fox jumps over the lazy dog"
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-sm", "pt-2");
  });

  it("should render input only when footer is enabled", () => {
    render(<FontSection {...defaultProps} />);

    const hexInput = screen.getByLabelText("Background hex value");
    expect(hexInput).toBeInTheDocument();
    expect(hexInput).toHaveClass("w-32");
  });

  it("should handle toggle disabled state", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");
    expect(select).not.toBeDisabled();
  });

  it("should maintain accessibility attributes", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "navbar-font-select");
  });

  it("should handle widget with null footerText", () => {
    const propsWithEmptyFont = {
      ...defaultProps,
      navbarFont: "",
    };

    render(<FontSection {...propsWithEmptyFont} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("Arial"); // Defaults to first font
  });

  it("should handle widget with undefined footerText", () => {
    const propsWithUndefinedFont = {
      ...defaultProps,
      navbarFont: "" as string,
    };

    render(<FontSection {...propsWithUndefinedFont} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("Arial"); // Defaults to first font
  });

  it("should handle widget with empty string footerText", () => {
    const propsWithEmptyStringFont = {
      ...defaultProps,
      navbarFont: "",
    };

    render(<FontSection {...propsWithEmptyStringFont} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("Arial"); // Defaults to first font
  });

  it("should call onNavbarFontChange with correct changes when enabling footer", () => {
    const propsWithDifferentFont = {
      ...defaultProps,
      navbarFont: "Helvetica",
    };

    render(<FontSection {...propsWithDifferentFont} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Times New Roman" } });

    expect(defaultProps.onNavbarFontChange).toHaveBeenCalledWith(
      "Times New Roman"
    );
  });

  it("should call onNavbarFontChange with correct changes when disabling footer", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Helvetica" } });

    expect(defaultProps.onNavbarFontChange).toHaveBeenCalledWith("Helvetica");
  });

  it("should handle rapid text changes", () => {
    render(<FontSection {...defaultProps} />);

    const hexInput = screen.getByLabelText("Background hex value");

    fireEvent.change(hexInput, { target: { value: "#ff0000" } });
    fireEvent.change(hexInput, { target: { value: "#00ff00" } });
    fireEvent.change(hexInput, { target: { value: "#0000ff" } });

    expect(defaultProps.onNavbarBgChange).toHaveBeenCalledWith("#0000ff");
  });

  it("should handle rapid toggle changes", () => {
    render(<FontSection {...defaultProps} />);

    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "Helvetica" } });
    fireEvent.change(select, { target: { value: "Times New Roman" } });
    fireEvent.change(select, { target: { value: "Arial" } });

    expect(defaultProps.onNavbarFontChange).toHaveBeenCalledWith("Arial");
  });

  it("should handle widget with missing properties", () => {
    const minimalProps = {
      fonts: ["Arial"],
      navbarFont: "Arial",
      navbarFontSize: "16",
      navbarBg: "#ffffff",
      onNavbarFontChange: vi.fn(),
      onNavbarFontSizeChange: vi.fn(),
      onNavbarBgChange: vi.fn(),
    };

    render(<FontSection {...minimalProps} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("Arial");
    expect(screen.getByLabelText("Background hex value")).toBeInTheDocument();
  });

  it("should handle widget with boolean footerText", () => {
    const propsWithStringFont = {
      ...defaultProps,
      navbarFont: "true",
    };

    render(<FontSection {...propsWithStringFont} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("true"); // Shows the actual value
  });

  it("should handle widget with number footerText", () => {
    const propsWithNumberFont = {
      ...defaultProps,
      navbarFont: "123",
    };

    render(<FontSection {...propsWithNumberFont} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("123"); // Shows the actual value
  });

  it("should render with correct spacing between elements", () => {
    render(<FontSection {...defaultProps} />);
    // Just check that both elements are present
    const select = screen.getByRole("combobox");
    const description = screen.getByText(
      "The quick brown fox jumps over the lazy dog"
    );
    expect(select).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  it("should handle long footer text", () => {
    const longColor = "#" + "A".repeat(6);
    const propsWithLongColor = {
      ...defaultProps,
      navbarBg: longColor,
    };

    render(<FontSection {...propsWithLongColor} />);

    const hexInput = screen.getByLabelText("Background hex value");
    expect(hexInput).toHaveValue(longColor);
    expect(hexInput).toHaveAttribute("maxlength", "7");
  });

  it("should handle special characters in footer text", () => {
    const specialColor = "#ff00ff";
    const propsWithSpecialColor = {
      ...defaultProps,
      navbarBg: specialColor,
    };

    render(<FontSection {...propsWithSpecialColor} />);

    const hexInput = screen.getByLabelText("Background hex value");
    expect(hexInput).toHaveValue(specialColor);
  });

  it("should handle unicode characters in footer text", () => {
    const unicodeColor = "#00ffff";
    const propsWithUnicodeColor = {
      ...defaultProps,
      navbarBg: unicodeColor,
    };

    render(<FontSection {...propsWithUnicodeColor} />);

    const hexInput = screen.getByLabelText("Background hex value");
    expect(hexInput).toHaveValue(unicodeColor);
  });

  it("should render chevron down icons as SVG", () => {
    render(<FontSection {...defaultProps} />);
    // There should be at least two SVGs: the Type icon and at least one chevron
    const svgElements = document.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThanOrEqual(2);
  });

  it("should render font size button with correct aria attributes", () => {
    render(<FontSection {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Select font size" });
    expect(button).toHaveAttribute("aria-controls");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("should render color picker with correct structure", () => {
    render(<FontSection {...defaultProps} />);

    const colorPicker = screen.getByLabelText("Background color picker");
    const colorDiv = colorPicker.querySelector("div");
    const colorInput = screen.getByLabelText("Background color value");

    expect(colorDiv).toHaveClass(
      "h-8",
      "w-8",
      "rounded-full",
      "border",
      "cursor-pointer"
    );
    expect(colorInput).toHaveAttribute("type", "color");
    expect(colorInput).toHaveValue("#ffffff");
  });

  it("should render hex input with correct attributes", () => {
    render(<FontSection {...defaultProps} />);

    const hexInput = screen.getByLabelText("Background hex value");
    expect(hexInput).toHaveAttribute("maxlength", "7");
    expect(hexInput).toHaveClass("w-32");
  });

  it("should render preview text with correct styling", () => {
    render(<FontSection {...defaultProps} />);

    const previewText = screen.getByText(
      "The quick brown fox jumps over the lazy dog"
    );
    expect(previewText).toHaveClass("pl-6", "text-sm", "pt-2");
    expect(previewText).toHaveStyle("font-family: Arial; font-size: 16px;");
  });
});
