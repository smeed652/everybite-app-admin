import { Check } from "lucide-react";

interface ToggleProps {
  /** determines current state */
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  /** accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * Reusable toggle switch component used across the admin panel.
 */
export function Toggle({
  checked,
  onChange,
  disabled,
  className = "",
  ariaLabel = "toggle",
}: ToggleProps) {
  // Coerce potentially undefined "checked" values to strict boolean to ensure
  // aria-checked is always rendered (required for role="switch" a11y rule).
  const isOn = !!checked;
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!isOn)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isOn ? "bg-brand" : "bg-gray-400"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      role="switch"
      aria-label={ariaLabel}
      aria-checked={isOn}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform flex items-center justify-center ${
          isOn ? "translate-x-6" : "translate-x-1"
        }`}
      >
        {isOn && <Check className="w-3 h-3 text-brand" />}
      </span>
    </button>
  );
}
