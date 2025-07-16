import { useEffect, useRef, useState } from "react";
import { logger } from "../../../lib/logger";
import { UseWidgetDiffOptions, UseWidgetDiffReturn } from "./types/widgetDiff";
import { deepClone, isEqual } from "./utils/diffHelpers";

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
      logger.debug(
        "[useWidgetDiff] nav effect detected id change, clearing diffs"
      );
      originalRef.current = deepClone(widget);
      logger.debug(
        "[useWidgetDiff] nav clear caller",
        new Error().stack?.split("\n")[2] ?? ""
      );
      setPendingChanges({});
      setFormKey(0);
    }
  }, [widget]);

  /* ------------------------- field change ------------------------------ */

  const handleFieldChange = (changes: Record<string, unknown>): void => {
    logger.debug(
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
         signal "no-op" by giving back the previous object. */
      const result = changed ? next : prev;
      logger.debug("[useWidgetDiff] pendingChanges next", result);
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
        logger.debug("[useWidgetDiff] reset flushSync clearing diffs");
        logger.debug(
          "[useWidgetDiff] reset clear caller",
          new Error().stack?.split("\n")[2] ?? ""
        );
        setPendingChanges({});
      });
    } catch {
      logger.debug(
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

  // Debug logging for troubleshooting timing issues
  logger.debug("[useWidgetDiff] current state:", {
    formKey,
    pendingChanges,
    dirty: Object.keys(pendingChanges).length > 0,
    originalWidget: originalRef.current,
    currentWidget: widget,
  });

  /* --------------------------- snapshot -------------------------------- */

  /** Accept current edits without hitting the server. */
  const refreshSnapshot = (): void => {
    if (widget) {
      originalRef.current = { ...widget, ...pendingChanges } as T;
      logger.debug("[useWidgetDiff] refreshSnapshot clearing diffs");
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
