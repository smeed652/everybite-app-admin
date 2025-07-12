import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useWidgetDiff } from "../useWidgetDiff";

interface Widget {
  id: string;
  name?: string;
  tags?: string[];
  active?: boolean;
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
const setup = (initial: Widget, opts?: Parameters<typeof useWidgetDiff<Widget>>[1]) =>
  renderHook(() => useWidgetDiff<Widget>(initial, opts));

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
});
