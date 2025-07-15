import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Widget } from "../../../../generated/graphql";
import { FeaturesPanel } from "../FeaturesPanel";

// Mock the GraphQL enums that FeaturesPanel uses
vi.mock("../../../../generated/graphql", () => ({
  __esModule: true,
  DietType: {
    Vegetarian: "Vegetarian",
    Pescatarian: "Pescatarian",
    Vegan: "Vegan",
  },
  AllergenType: {
    Wheat: "Wheat",
    Dairy: "Dairy",
    Egg: "Egg",
    Fish: "Fish",
    Shellfish: "Shellfish",
    TreeNut: "TreeNut",
    Peanut: "Peanut",
    Sesame: "Sesame",
    Soy: "Soy",
  },
}));

// Minimal stub for Widget type with only the fields FeaturesPanel reads.
function makeWidget(partial: Partial<Widget>): Widget {
  return {
    id: "1",
    name: "Test",
    slug: "test",
    layout: "FULL",
    displayImages: false,
    isActive: true,
    isOrderButtonEnabled: false,
    primaryBrandColor: null,
    highlightColor: null,
    backgroundColor: null,
    orderUrl: null,
    supportedDietaryPreferences: [],
    displayIngredients: false,
    supportedAllergens: [],
    displayNutrientPreferences: false,
    displayMacronutrients: false,
    isByoEnabled: false,
    displaySoftSignUp: false,
    displayNotifyMeBanner: false,
    displayGiveFeedbackBanner: false,
    displayFeedbackButton: false,
    displayDishDetailsLink: false,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    // spread overrides
    ...partial,
  } as Widget;
}

describe("FeaturesPanel – enum normalisation", () => {
  const widget = makeWidget({
    supportedDietaryPreferences: ["Vegetarian" as any],
    supportedAllergens: ["TreeNut", "Wheat"] as any,
  });

  it("pre-selects checkboxes based on API values (including CamelCase)", () => {
    render(<FeaturesPanel widget={widget} onFieldChange={() => {}} />);

    // Diets
    expect(screen.getByLabelText("Vegetarian")).toBeChecked();
    expect(screen.getByLabelText("Vegan")).not.toBeChecked();

    // Allergens
    expect(screen.getByLabelText("Tree Nut")).toBeChecked();
    expect(screen.getByLabelText("Wheat")).toBeChecked();
    expect(screen.getByLabelText("Peanut")).not.toBeChecked();
  });
});

describe("FeaturesPanel – timing issue fix", () => {
  it("does not emit false positive changes when widget has no allergens", () => {
    const onFieldChange = vi.fn();
    const widget = makeWidget({
      supportedDietaryPreferences: [],
      supportedAllergens: [],
    });

    render(<FeaturesPanel widget={widget} onFieldChange={onFieldChange} />);

    // Should not emit any changes on mount when widget has no allergens
    expect(onFieldChange).not.toHaveBeenCalled();
  });

  it("does not emit false positive changes when widget has no dietary preferences", () => {
    const onFieldChange = vi.fn();
    const widget = makeWidget({
      supportedDietaryPreferences: [],
      supportedAllergens: ["Wheat"],
    });

    render(<FeaturesPanel widget={widget} onFieldChange={onFieldChange} />);

    // Should not emit any changes on mount when widget has no dietary preferences
    expect(onFieldChange).not.toHaveBeenCalled();
  });
});
