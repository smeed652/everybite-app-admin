import { Card } from './Card';
import { Toggle } from './Toggle';
import * as React from 'react';

/**
 * Generic section that shows:
 * - Icon + title + optional "Select All" button
 * - Description text
 * - Enable/disable toggle for the whole group
 * - When enabled: checkbox grid of selectable options
 *
 * This is intended to replace duplicated UI patterns such as AllergensSection,
 * DietarySection, NutrientsSection, etc. Keep the component highly reusable
 * by controlling most behaviour through props.
 */
export interface OptionToggleSectionProps<T extends string> {
  /** Optional leading icon shown before the title */
  icon?: React.ReactNode;
  /** Section title */
  title: string;
  /** Optional helper/description text */
  description?: string;
  /** Fixed list of selectable option values */
  options: readonly T[];
  /** Whether the entire section is enabled */
  enabled: boolean;
  /** Handler called when user toggles section enabled */
  onToggleEnabled: (next: boolean) => void;
  /** Currently-selected option values */
  selected: readonly T[];
  /** Handler called with **full** updated list on any selection change */
  onChangeSelected: (next: T[]) => void;
  /**
   * Optional mapping from option value to label displayed in UI.
   * Defaults to value as-is.
   */
  optionLabel?: (v: T) => string;
  /** Text for the "Select All" button. Omit to hide the button. */
  selectAllLabel?: string;
  /** Optional extra Tailwind className forwarded to <Card>. */
  className?: string;
}

export function OptionToggleSection<T extends string>(props: OptionToggleSectionProps<T>) {
  const {
    icon,
    title,
    description,
    options,
    enabled,
    onToggleEnabled,
    selected,
    onChangeSelected,
    optionLabel = (v: T) => String(v) as string,
    selectAllLabel = 'Select All',
    className,
  } = props;

  const toggleItem = React.useCallback(
    (value: T) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChangeSelected(next as T[]);
    },
    [selected, onChangeSelected]
  );

  return (
    <Card className={className ?? 'p-4 space-y-4'}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
            {enabled && selectAllLabel && (
              <button
                type="button"
                onClick={() => onChangeSelected(options as T[])}
                className="text-xs underline text-blue-600 hover:text-blue-800"
              >
                {selectAllLabel}
              </button>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Toggle checked={enabled} onChange={onToggleEnabled} ariaLabel={title} />
      </div>

      {/* Options grid */}
      {enabled && (
        <div className="pl-6 grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <label key={String(opt)} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.includes(opt)}
                onChange={() => toggleItem(opt)}
              />
              {optionLabel(opt)}
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}
