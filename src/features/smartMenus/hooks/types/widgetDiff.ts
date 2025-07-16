export interface UseWidgetDiffOptions {
  /** Treat an undefined array as an empty array when comparing diffs. */
  coerceArrayUndefined?: boolean;
  /**
   * After reset() merge any `pendingChanges` into the internal snapshot so
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
