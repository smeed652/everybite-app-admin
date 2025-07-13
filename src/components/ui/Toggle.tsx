
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
export function Toggle({ checked, onChange, disabled, className = '', ariaLabel = 'toggle' }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
