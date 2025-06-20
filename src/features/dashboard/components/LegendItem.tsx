interface LegendItemProps {
  color: string;
  label: string;
}

/**
 * Small dot + label used in chart legends.
 */
export function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
