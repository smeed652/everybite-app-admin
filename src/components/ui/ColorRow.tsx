import { Input } from './Input';

/**
 * Small helper row for a label + HEX color picker input.
 * Reused across branding panels to keep parent files short.
 */
export function ColorRow({
  label,
  value,
  onChange,
  className = '',
  indent = 0,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  /** Tailwind padding-left scale (e.g. 0,1,2,4) applied to entire row when extra indent is needed */
  indent?: 0 | 1 | 2 | 4 | 6;
}) {
  const validHex = /^#([0-9a-fA-F]{6})$/;
  const safeValue = validHex.test(value) ? value : '#ffffff';

  const indentClass = indent ? `pl-${indent}` : '';

  return (
    <div className={`grid grid-cols-[10rem_auto_auto] items-center gap-3 ${indentClass} ${className}`.trim()}>
      <div className="text-sm font-medium">{label}</div>

      {/* visual chip */}
      <div className="relative flex items-center">
        <div
          className="h-8 w-8 rounded-full border cursor-pointer"
          style={{ background: safeValue }}
        />
        <input
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="absolute top-0 left-0 h-8 w-8 opacity-0 cursor-pointer"
        />
      </div>

      {/* hex input */}
      <Input
        value={value}
        maxLength={7}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || /^#([0-9a-fA-F]{0,6})$/.test(v)) onChange(v);
        }}
        className="w-32"
      />
    </div>
  );
}
