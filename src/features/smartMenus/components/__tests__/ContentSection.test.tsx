import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContentSection from "../ContentSection";

// No need to mock ColorRow - use the actual component

describe("ContentSection", () => {
  const defaultProps = {
    contentGlobalColor: "#000000",
    onGlobalColorChange: vi.fn(),
    contentHeaderColor: "#ffffff",
    onHeaderColorChange: vi.fn(),
    fonts: ["Arial", "Helvetica", "Times New Roman"],
    categoryFont: "Arial",
    onCategoryFontChange: vi.fn(),
    categoryColor: "#333333",
    onCategoryColorChange: vi.fn(),
  };

  it("should render the component with all elements", () => {
    render(<ContentSection {...defaultProps} />);

    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Global Content Color")).toBeInTheDocument();
    expect(screen.getByText("Column Header Color")).toBeInTheDocument();
    expect(screen.getByText("Category Title Font")).toBeInTheDocument();
    expect(screen.getByText("Category Title Color")).toBeInTheDocument();
  });

  it("should render the Paintbrush2 icon", () => {
    render(<ContentSection {...defaultProps} />);

    const icon = document.querySelector("svg[aria-hidden='true']");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("should render ColorRow components with correct props", () => {
    render(<ContentSection {...defaultProps} />);

    // Check that ColorRow components are rendered
    expect(screen.getByText("Global Content Color")).toBeInTheDocument();
    expect(screen.getByText("Column Header Color")).toBeInTheDocument();
    expect(screen.getByText("Category Title Color")).toBeInTheDocument();
  });

  it("should render font select with correct options", () => {
    render(<ContentSection {...defaultProps} />);

    const fontSelect = screen.getByRole("combobox");
    expect(fontSelect).toBeInTheDocument();
    expect(fontSelect).toHaveValue("Arial");

    // Check that all fonts are rendered as options
    expect(screen.getByRole("option", { name: "Arial" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Helvetica" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Times New Roman" })
    ).toBeInTheDocument();
  });

  it("should apply font family style to select element", () => {
    render(<ContentSection {...defaultProps} />);

    const fontSelect = screen.getByRole("combobox");
    expect(fontSelect).toHaveStyle({ fontFamily: "Arial" });
  });

  it("should apply font family style to option elements", () => {
    render(<ContentSection {...defaultProps} />);

    const arialOption = screen.getByRole("option", { name: "Arial" });
    const helveticaOption = screen.getByRole("option", { name: "Helvetica" });
    const timesOption = screen.getByRole("option", { name: "Times New Roman" });

    expect(arialOption).toHaveStyle({ fontFamily: "Arial" });
    expect(helveticaOption).toHaveStyle({ fontFamily: "Helvetica" });
    expect(timesOption).toHaveStyle({ fontFamily: "Times New Roman" });
  });

  it("should call onGlobalColorChange when global color is changed", () => {
    render(<ContentSection {...defaultProps} />);

    const globalColorInput = screen.getByLabelText(
      "Global Content Color hex value"
    );
    fireEvent.change(globalColorInput, { target: { value: "#ff0000" } });

    expect(defaultProps.onGlobalColorChange).toHaveBeenCalledWith("#ff0000");
  });

  it("should call onHeaderColorChange when header color is changed", () => {
    render(<ContentSection {...defaultProps} />);

    const headerColorInput = screen.getByLabelText(
      "Column Header Color hex value"
    );
    fireEvent.change(headerColorInput, { target: { value: "#00ff00" } });

    expect(defaultProps.onHeaderColorChange).toHaveBeenCalledWith("#00ff00");
  });

  it("should call onCategoryColorChange when category color is changed", () => {
    render(<ContentSection {...defaultProps} />);

    const categoryColorInput = screen.getByLabelText(
      "Category Title Color hex value"
    );
    fireEvent.change(categoryColorInput, { target: { value: "#0000ff" } });

    expect(defaultProps.onCategoryColorChange).toHaveBeenCalledWith("#0000ff");
  });

  it("should call onCategoryFontChange when font is selected", () => {
    render(<ContentSection {...defaultProps} />);

    const fontSelect = screen.getByRole("combobox");
    fireEvent.change(fontSelect, { target: { value: "Helvetica" } });

    expect(defaultProps.onCategoryFontChange).toHaveBeenCalledWith("Helvetica");
  });

  it("should handle empty fonts array", () => {
    const propsWithEmptyFonts = {
      ...defaultProps,
      fonts: [],
    };

    render(<ContentSection {...propsWithEmptyFonts} />);

    const fontSelect = screen.getByRole("combobox");
    expect(fontSelect).toBeInTheDocument();
    expect(fontSelect).toHaveValue("Arial"); // Should still show the current font
  });

  it("should handle undefined categoryFont", () => {
    const propsWithUndefinedFont = {
      ...defaultProps,
      categoryFont: "" as string,
    };

    render(<ContentSection {...propsWithUndefinedFont} />);

    const fontSelect = screen.getByRole("combobox");
    expect(fontSelect).toBeInTheDocument();
    expect(fontSelect).toHaveValue("Arial"); // Defaults to first font
  });

  it("should filter out duplicate fonts", () => {
    const propsWithDuplicateFonts = {
      ...defaultProps,
      fonts: ["Arial", "Arial", "Helvetica", "Helvetica", "Times New Roman"],
    };

    render(<ContentSection {...propsWithDuplicateFonts} />);

    const fontSelect = screen.getByRole("combobox");
    const options = fontSelect.querySelectorAll("option");

    // Should have unique fonts only
    expect(options).toHaveLength(3);
    expect(screen.getByRole("option", { name: "Arial" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Helvetica" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Times New Roman" })
    ).toBeInTheDocument();
  });

  it("should filter out falsy font values", () => {
    const propsWithFalsyFonts = {
      ...defaultProps,
      fonts: ["Arial", "", "Helvetica", "Times New Roman"] as string[],
    };

    render(<ContentSection {...propsWithFalsyFonts} />);

    const fontSelect = screen.getByRole("combobox");
    const options = fontSelect.querySelectorAll("option");

    // Should have only truthy fonts
    expect(options).toHaveLength(3);
    expect(screen.getByRole("option", { name: "Arial" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Helvetica" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Times New Roman" })
    ).toBeInTheDocument();
  });

  it("should handle font not in the fonts array", () => {
    const propsWithCustomFont = {
      ...defaultProps,
      categoryFont: "Custom Font",
    };

    render(<ContentSection {...propsWithCustomFont} />);

    const fontSelect = screen.getByRole("combobox");
    expect(fontSelect).toHaveValue("Custom Font");

    // Should show the custom font as an option
    expect(
      screen.getByRole("option", { name: "Custom Font" })
    ).toBeInTheDocument();
  });

  it("should apply correct CSS classes", () => {
    render(<ContentSection {...defaultProps} />);

    const card = screen.getByText("Content").closest(".rounded-lg");
    expect(card).toHaveClass("space-y-4");

    const iconContainer = screen.getByText("Content").closest("div");
    expect(iconContainer).toHaveClass(
      "flex",
      "items-center",
      "gap-2",
      "text-sm",
      "font-medium"
    );
  });

  it("should render with correct spacing structure", () => {
    render(<ContentSection {...defaultProps} />);

    const mainContainer = screen.getByText("Content").closest(".space-y-4");
    expect(mainContainer).toBeInTheDocument();

    // Check that all ColorRow components are within the main container
    expect(mainContainer).toContainElement(
      screen.getByText("Global Content Color")
    );
    expect(mainContainer).toContainElement(
      screen.getByText("Column Header Color")
    );
    expect(mainContainer).toContainElement(
      screen.getByText("Category Title Color")
    );
  });

  it("should render font selection with correct structure", () => {
    render(<ContentSection {...defaultProps} />);

    const fontLabel = screen.getByText("Category Title Font");
    const fontSelect = screen.getByRole("combobox");

    expect(fontLabel).toHaveAttribute("for", "category-font");
    expect(fontSelect).toHaveAttribute("id", "category-font");
    expect(fontSelect).toHaveClass(
      "border",
      "rounded",
      "px-2",
      "py-1",
      "text-sm",
      "w-60"
    );
  });

  it("should handle multiple color changes in sequence", () => {
    render(<ContentSection {...defaultProps} />);

    const globalColorInput = screen.getByLabelText(
      "Global Content Color hex value"
    );
    const headerColorInput = screen.getByLabelText(
      "Column Header Color hex value"
    );
    const categoryColorInput = screen.getByLabelText(
      "Category Title Color hex value"
    );

    fireEvent.change(globalColorInput, { target: { value: "#ff0000" } });
    fireEvent.change(headerColorInput, { target: { value: "#00ff00" } });
    fireEvent.change(categoryColorInput, { target: { value: "#0000ff" } });

    expect(defaultProps.onGlobalColorChange).toHaveBeenCalledWith("#ff0000");
    expect(defaultProps.onHeaderColorChange).toHaveBeenCalledWith("#00ff00");
    expect(defaultProps.onCategoryColorChange).toHaveBeenCalledWith("#0000ff");
  });

  it("should handle font changes with different fonts", () => {
    render(<ContentSection {...defaultProps} />);

    const fontSelect = screen.getByRole("combobox");

    fireEvent.change(fontSelect, { target: { value: "Helvetica" } });
    expect(defaultProps.onCategoryFontChange).toHaveBeenCalledWith("Helvetica");

    fireEvent.change(fontSelect, { target: { value: "Times New Roman" } });
    expect(defaultProps.onCategoryFontChange).toHaveBeenCalledWith(
      "Times New Roman"
    );
  });

  it("should maintain accessibility attributes", () => {
    render(<ContentSection {...defaultProps} />);

    const fontLabel = screen.getByText("Category Title Font");
    const fontSelect = screen.getByRole("combobox");

    expect(fontLabel).toHaveAttribute("for", "category-font");
    expect(fontSelect).toHaveAttribute("id", "category-font");
  });

  it("should handle empty string color values", () => {
    const propsWithEmptyColors = {
      ...defaultProps,
      contentGlobalColor: "",
      contentHeaderColor: "",
      categoryColor: "",
    };

    render(<ContentSection {...propsWithEmptyColors} />);

    const globalColorInput = screen.getByLabelText(
      "Global Content Color hex value"
    );
    const headerColorInput = screen.getByLabelText(
      "Column Header Color hex value"
    );
    const categoryColorInput = screen.getByLabelText(
      "Category Title Color hex value"
    );

    expect(globalColorInput).toHaveValue("");
    expect(headerColorInput).toHaveValue("");
    expect(categoryColorInput).toHaveValue("");
  });

  it("should handle null color values", () => {
    const propsWithNullColors = {
      ...defaultProps,
      contentGlobalColor: "",
      contentHeaderColor: "",
      categoryColor: "",
    };

    render(<ContentSection {...propsWithNullColors} />);

    const globalColorInput = screen.getByLabelText(
      "Global Content Color hex value"
    );
    const headerColorInput = screen.getByLabelText(
      "Column Header Color hex value"
    );
    const categoryColorInput = screen.getByLabelText(
      "Category Title Color hex value"
    );

    expect(globalColorInput).toHaveValue("");
    expect(headerColorInput).toHaveValue("");
    expect(categoryColorInput).toHaveValue("");
  });
});
