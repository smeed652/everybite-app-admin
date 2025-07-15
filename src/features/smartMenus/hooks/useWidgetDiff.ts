import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------------- */
/* Types                                                                     */
/* ------------------------------------------------------------------------- */

export interface UseWidgetDiffOptions {
  /** Treat an undefined array as an empty array when comparing diffs. */
  coerceArrayUndefined?: boolean;
  /**
   * After [reset()](cci:1://file:///Volumes/External%20Drive/Local%20Everybite%20Development/Front%20End/everybite-admin-app/src/features/smartMenus/hooks/useWidgetDiff.ts:96:2-120:4) merge any `pendingChanges` into the internal snapshot so
   * subsequent edits are compared to the latest saved state.
   */
  refreshSnapshotOnReset?: boolean;
}

/** The public shape returned by the hook. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UseWidgetDiffReturn<T> {
  /** Changing this key forces remounting of child forms. */
  formKey: number;
  /** Map of field → new value for unsaved edits. */
  pendingChanges: Record<string, unknown>;
  /** True when `pendingChanges` is non-empty. */
  dirty: boolean;
  /** Call when any field changes. */
  handleFieldChange: (changes: Record<string, unknown>) => void;
  /** Cancel edits and reset diff state. */
  reset: () => void;
  /** Accept current edits as the new snapshot without saving externally. */
  refreshSnapshot: () => void;
}

/* ------------------------------------------------------------------------- */
/* Hook                                                                      */
/* ------------------------------------------------------------------------- */

export function useWidgetDiff<T extends { id?: string }>(
  widget: T | null,
  {
    coerceArrayUndefined = false,
    refreshSnapshotOnReset = false,
  }: UseWidgetDiffOptions = {}
): UseWidgetDiffReturn<T> {
  /* -------------------------------------------------- state / refs ------ */

  const [formKey, setFormKey] = useState(0);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>(
    {}
  );

  /** Ignore incoming field events during the synchronous part of reset(). */
  const ignoreRef = useRef(false);

  // snapshot of original widget for diff comparison (deep-cloned to avoid mutation)
  const originalRef = useRef<T | null>(null);

  /* ------------------ keep snapshot in sync when navigating ------------ */
  // Track first render to avoid treating initial mount as navigation.
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!widget) return;

    // On first render just capture snapshot, don't clear diffs.
    if (!mountedRef.current) {
      mountedRef.current = true;
      originalRef.current = deepClone(widget);
      return;
    }

    // Genuine navigation between widgets – clear edits.
    const currentId = (originalRef.current as { id?: string } | null)?.id;
    if (currentId !== widget.id) {
      console.debug(
        "[useWidgetDiff] nav effect detected id change, clearing diffs"
      );
      originalRef.current = deepClone(widget);
      console.debug(
        "[useWidgetDiff] nav clear caller",
        new Error().stack?.split("\n")[2] ?? ""
      );
      setPendingChanges({});
      setFormKey(0);
    }
  }, [widget]);

  /* ---------------------------- helpers -------------------------------- */
  const deepClone = <K>(o: K): K => JSON.parse(JSON.stringify(o));

  // Helper: normalize arrays for comparison (undefined → [], sorted)
  const normalizeArray = (arr: unknown): unknown => {
    if (Array.isArray(arr)) {
      // Sort array for stable comparison (string/number only)
      return [...arr].sort();
    }
    if (arr === undefined) return [];
    return arr;
  };

  const isEqual = (a: unknown, b: unknown) => {
    // If both are arrays or undefined, normalize and compare
    if (
      Array.isArray(a) ||
      Array.isArray(b) ||
      a === undefined ||
      b === undefined
    ) {
      return (
        JSON.stringify(normalizeArray(a)) === JSON.stringify(normalizeArray(b))
      );
    }
    return JSON.stringify(a) === JSON.stringify(b);
  };

  /* ------------------------- field change ------------------------------ */

  const handleFieldChange = (changes: Record<string, unknown>): void => {
    console.debug(
      "[useWidgetDiff] handleFieldChange incoming",
      changes,
      "origin",
      new Error().stack?.split("\n")[3] ?? ""
    );

    if (ignoreRef.current || !widget) return;
    // Ignore noop calls that contain no actual changes so we don't clear existing diffs
    if (!changes || Object.keys(changes).length === 0) return;
    // If every incoming key equals its snapshot value, treat as no-op.
    const matchesSnapshot = Object.entries(changes).every(([k, v]) =>
      isEqual(
        originalRef.current
          ? (originalRef.current as Record<string, unknown>)[k]
          : undefined,
        v
      )
    );
    if (matchesSnapshot) return;

    setPendingChanges((prev) => {
      // Start with previous diff so unrelated keys are preserved
      const next: Record<string, unknown> = { ...prev };

      let changed = false;

      Object.entries(changes).forEach(([key, value]) => {
        // Look up original baseline value for this key only
        let original: unknown = originalRef.current
          ? (originalRef.current as Record<string, unknown>)[key]
          : undefined;

        // Normalise `undefined` when required so false/[]/'' are not considered dirty
        if (original === undefined) {
          if (value === null) original = null;
          else if (Array.isArray(value))
            original = coerceArrayUndefined ? [] : undefined;
          else if (typeof value === "boolean") original = false;
          else if (typeof value === "number") original = 0;
          else if (typeof value === "string") original = "";
        }

        if (isEqual(original, value)) {
          // Only remove the key if it was previously dirty. Otherwise ignore
          if (key in next) {
            delete next[key];
            changed = true;
          }
        } else if (!isEqual(next[key], value)) {
          next[key] = value;
          changed = true;
        }
      });

      /* Avoid an unnecessary state update when nothing actually changed.
         React will bail out when the same reference is returned, so we can
         signal “no-op” by giving back the previous object. */
      const result = changed ? next : prev;
      console.debug("[useWidgetDiff] pendingChanges next", result);
      return result;
    });
  };

  /* ------------------------------ reset -------------------------------- */

  const reset = (): void => {
    ignoreRef.current = true;

    /* Synchronously clear pendingChanges so consuming components see the
       updated props before the click handler returns (important for tests). */
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { flushSync } = require("react-dom");
      flushSync(() => {
        console.debug("[useWidgetDiff] reset flushSync clearing diffs");
        console.debug(
          "[useWidgetDiff] reset clear caller",
          new Error().stack?.split("\n")[2] ?? ""
        );
        setPendingChanges({});
      });
    } catch {
      console.debug(
        "[useWidgetDiff] reset non-sync clear caller",
        new Error().stack?.split("\n")[2] ?? ""
      );
      setPendingChanges({});
    }

    ignoreRef.current = false;

    // Optionally merge pendingChanges into snapshot so new edits diff correctly
    if (refreshSnapshotOnReset && widget) {
      originalRef.current = { ...widget, ...pendingChanges } as T;
    }

    // Force form rerender/remount so all child inputs reset visually
    setFormKey((k) => k + 1);
  };

  // Debug logging removed to reduce console spam

  /* --------------------------- snapshot -------------------------------- */

  /** Accept current edits without hitting the server. */
  const refreshSnapshot = (): void => {
    if (widget) {
      originalRef.current = { ...widget, ...pendingChanges } as T;
      console.debug("[useWidgetDiff] refreshSnapshot clearing diffs");
      setPendingChanges({});
    }
  };

  /* --------------------------------------------------------------------- */

  return {
    formKey,
    pendingChanges,
    dirty: Object.keys(pendingChanges).length > 0,
    handleFieldChange,
    reset,
    refreshSnapshot,
  };
}
