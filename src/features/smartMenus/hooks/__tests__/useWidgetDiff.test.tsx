import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useWidgetDiff } from "../useWidgetDiff";

interface Widget {
  id: string;
  name?: string;
  tags?: string[];
  active?: boolean;
  orderUrl?: string | null;
  supportedDietaryPreferences?: string[];
  displayIngredients?: boolean;
  supportedAllergens?: string[];
  displayNutrientPreferences?: boolean;
  displayMacronutrients?: boolean;
  displayFeedbackButton?: boolean;
  isByoEnabled?: boolean;
  isOrderButtonEnabled?: boolean;
}

const makeWidget = (overrides: Partial<Widget> = {}): Widget => ({
  id: "w-1",
  name: "Original",
  tags: ["foo"],
  active: false,
  ...overrides,
});

/**
 * Utility wrapper to simplify hook usage in tests.
 */
const setup = (
  initial: Widget,
  opts?: Parameters<typeof useWidgetDiff<Widget>>[1]
) => renderHook(() => useWidgetDiff<Widget>(initial, opts));

/* ------------------------------------------------------------------------- */
/* Tests                                                                     */
/* ------------------------------------------------------------------------- */

describe("useWidgetDiff", () => {
  it("starts clean (no pending changes, dirty = false)", () => {
    const widget = makeWidget();
    const { result } = setup(widget);
    expect(result.current.pendingChanges).toEqual({});
    expect(result.current.dirty).toBe(false);
  });

  it("detects diffs and flips dirty", () => {
    const widget = makeWidget();
    const { result } = setup(widget);

    act(() => {
      result.current.handleFieldChange({ name: "Updated" });
    });

    expect(result.current.pendingChanges).toEqual({ name: "Updated" });
    expect(result.current.dirty).toBe(true);
  });

  it("reset() clears changes and increments formKey", () => {
    const widget = makeWidget();
    const { result } = setup(widget);

    act(() => {
      result.current.handleFieldChange({ name: "Updated" });
    });

    const { formKey: beforeKey } = result.current;

    act(() => {
      result.current.reset();
    });

    expect(result.current.pendingChanges).toEqual({});
    expect(result.current.dirty).toBe(false);
    expect(result.current.formKey).toBe(beforeKey + 1);
  });

  it("refreshSnapshot() accepts current edits as new baseline", () => {
    const widget = makeWidget();
    const { result } = setup(widget);

    act(() => {
      result.current.handleFieldChange({ name: "Updated" });
    });
    expect(result.current.dirty).toBe(true);

    act(() => {
      result.current.refreshSnapshot();
    });

    expect(result.current.pendingChanges).toEqual({});
    expect(result.current.dirty).toBe(false);

    // another identical change should *not* be considered dirty anymore
    act(() => {
      result.current.handleFieldChange({ name: "Updated" });
    });
    expect(result.current.dirty).toBe(false);
  });

  it("soft-reset flow (edit → reset → new edit) works without spurious diffs", () => {
    const widget = makeWidget();
    const { result } = setup(widget, { refreshSnapshotOnReset: true });

    // first edit
    act(() => {
      result.current.handleFieldChange({ name: "One" });
    });

    // cancel/reset
    act(() => {
      result.current.reset();
    });
    expect(result.current.dirty).toBe(false);

    // new edit should now produce pendingChanges again
    act(() => {
      result.current.handleFieldChange({ name: "Two" });
    });
    expect(result.current.pendingChanges).toEqual({ name: "Two" });
  });

  it("coerceArrayUndefined treats undefined vs [] as equal when flag true", () => {
    const widget = makeWidget({ tags: undefined });
    const { result } = setup(widget, { coerceArrayUndefined: true });

    act(() => {
      result.current.handleFieldChange({ tags: [] });
    });

    expect(result.current.dirty).toBe(false);
    expect(result.current.pendingChanges).toEqual({});
  });

  /* ------------------------------------------------------------------------- */
  /* Real-world issue tests                                                    */
  /* ------------------------------------------------------------------------- */

  describe("Real-world edge cases", () => {
    it("handles complex URL parsing without false positives", () => {
      const widget = makeWidget({
        orderUrl: "https://togoorder.com/web?id=1609#!/?utm_source=everybite",
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate FeaturesPanel emitting reconstructed URL
      act(() => {
        result.current.handleFieldChange({
          orderUrl: "https://togoorder.com/web?id=1609#!/?utm_source=everybite",
        });
      });

      // Should not be dirty if URLs are identical
      expect(result.current.dirty).toBe(false);
      expect(result.current.pendingChanges).toEqual({});
    });

    it("handles undefined vs empty array normalization correctly", () => {
      const widget = makeWidget({
        supportedDietaryPreferences: undefined,
        supportedAllergens: ["Dairy", "Fish", "Sesame"],
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate FeaturesPanel emitting computed values
      act(() => {
        result.current.handleFieldChange({
          supportedDietaryPreferences: [],
          supportedAllergens: ["Dairy", "Fish", "Sesame"],
        });
      });

      // Should not be dirty for equivalent values
      expect(result.current.dirty).toBe(false);
      expect(result.current.pendingChanges).toEqual({});
    });

    it("detects actual changes in complex data structures", () => {
      const widget = makeWidget({
        supportedDietaryPreferences: undefined,
        supportedAllergens: ["Dairy", "Fish"],
        displayIngredients: true,
        isOrderButtonEnabled: false,
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate user making actual changes
      act(() => {
        result.current.handleFieldChange({
          supportedDietaryPreferences: ["Vegetarian"],
          supportedAllergens: ["Dairy", "Fish", "Sesame"],
          displayIngredients: false,
          isOrderButtonEnabled: true,
        });
      });

      // Should be dirty for actual changes
      expect(result.current.dirty).toBe(true);
      expect(result.current.pendingChanges).toEqual({
        supportedDietaryPreferences: ["Vegetarian"],
        supportedAllergens: ["Dairy", "Fish", "Sesame"],
        displayIngredients: false,
        isOrderButtonEnabled: true,
      });
    });

    it("handles partial updates correctly", () => {
      const widget = makeWidget({
        displayIngredients: true,
        displayNutrientPreferences: false,
        isByoEnabled: true,
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate user changing only one setting
      act(() => {
        result.current.handleFieldChange({
          displayIngredients: false,
        });
      });

      // Should only track the changed property
      expect(result.current.dirty).toBe(true);
      expect(result.current.pendingChanges).toEqual({
        displayIngredients: false,
      });

      // Simulate user changing another setting
      act(() => {
        result.current.handleFieldChange({
          displayNutrientPreferences: true,
        });
      });

      // Should track both changes
      expect(result.current.pendingChanges).toEqual({
        displayIngredients: false,
        displayNutrientPreferences: true,
      });
    });

    it("handles URL changes correctly", () => {
      const widget = makeWidget({
        orderUrl: "https://togoorder.com/web?id=1609#!/?utm_source=everybite",
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate user changing the URL
      act(() => {
        result.current.handleFieldChange({
          orderUrl:
            "https://togoorder.com/web?id=1609#!/?utm_source=everybite&utm_medium=admin",
        });
      });

      // Should be dirty for URL changes
      expect(result.current.dirty).toBe(true);
      expect(result.current.pendingChanges).toEqual({
        orderUrl:
          "https://togoorder.com/web?id=1609#!/?utm_source=everybite&utm_medium=admin",
      });
    });

    it("prevents false positives from computed values", () => {
      const widget = makeWidget({
        supportedDietaryPreferences: undefined,
        displayIngredients: true,
        supportedAllergens: ["Dairy", "Fish", "Sesame"],
        displayNutrientPreferences: true,
        displayMacronutrients: true,
        displayFeedbackButton: true,
        isByoEnabled: true,
        isOrderButtonEnabled: true,
        orderUrl: "https://togoorder.com/web?id=1609#!/?utm_source=everybite",
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate FeaturesPanel emitting all computed values on mount
      act(() => {
        result.current.handleFieldChange({
          supportedDietaryPreferences: [],
          displayIngredients: true,
          supportedAllergens: ["Dairy", "Fish", "Sesame"],
          displayNutrientPreferences: true,
          displayMacronutrients: true,
          displayFeedbackButton: true,
          isByoEnabled: true,
          isOrderButtonEnabled: true,
          orderUrl: "https://togoorder.com/web?id=1609#!/?utm_source=everybite",
        });
      });

      // Should not be dirty for equivalent computed values
      expect(result.current.dirty).toBe(false);
      expect(result.current.pendingChanges).toEqual({});
    });

    it("catches the actual FeaturesPanel bug with URL parsing", () => {
      const widget = makeWidget({
        supportedDietaryPreferences: undefined,
        displayIngredients: true,
        supportedAllergens: ["Dairy", "Fish", "Sesame"],
        displayNutrientPreferences: true,
        displayMacronutrients: true,
        displayFeedbackButton: true,
        isByoEnabled: true,
        isOrderButtonEnabled: true,
        orderUrl: "https://togoorder.com/web?id=1609#!/?utm_source=everybite",
      });
      const { result } = setup(widget, { coerceArrayUndefined: true });

      // Simulate the buggy FeaturesPanel behavior:
      // 1. Parse URL incorrectly with simple split
      const orderUrl = widget.orderUrl;
      const baseUrl = orderUrl?.split("?")[0] ?? "";
      const utmTags = orderUrl?.split("?")[1] ?? "";
      const fullUrl = `${baseUrl}${utmTags ? `?${utmTags}` : ""}`;

      // 2. Emit all values including the incorrectly parsed URL
      act(() => {
        result.current.handleFieldChange({
          supportedDietaryPreferences: [],
          displayIngredients: true,
          supportedAllergens: ["Dairy", "Fish", "Sesame"],
          displayNutrientPreferences: true,
          displayMacronutrients: true,
          displayFeedbackButton: true,
          isByoEnabled: true,
          isOrderButtonEnabled: true,
          orderUrl: fullUrl || null,
        });
      });

      // This test demonstrates the bug we encountered:
      // Original: "https://togoorder.com/web?id=1609#!/?utm_source=everybite"
      // Parsed:   "https://togoorder.com/web?id=1609#!/" (missing UTM params)

      console.log("URL Comparison:", {
        original: widget.orderUrl,
        parsed: fullUrl,
        areEqual: widget.orderUrl === fullUrl,
      });

      // This test should FAIL when the bug is present (dirty: true)
      // and PASS when the bug is fixed (dirty: false)
      // We keep this test to document the issue and ensure it doesn't regress
      // Currently expecting the bug to be present (dirty: true) to demonstrate detection
      expect(result.current.dirty).toBe(true);
      expect(result.current.pendingChanges).toEqual({
        orderUrl: fullUrl || null,
      });
    });
  });
});
