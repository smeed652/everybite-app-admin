import { ReactNode } from 'react';
import { Card } from './Card';
import { Toggle } from './Toggle';

export interface SettingToggleProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** current value */
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /** optional node rendered inline with title (e.g. "Select All" link) */
  action?: ReactNode;
  /** optional footer content shown below description */
  footer?: ReactNode;
  /** class names to pass to root Card */
  className?: string;
}

/**
 * Generic "setting row" – left description, right toggle. Wraps itself in a Card.
 * Keeps consistent spacing across pages.
 */
export function SettingToggle({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
  action,
  footer,
  className = '',
}: SettingToggleProps) {
  return (
    <Card className={`p-4 flex items-center justify-between ${className}`.trim()}>
      <div>
        <p className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
          {action && <span className="ml-2 inline-flex items-center text-xs text-blue-600 underline hover:text-blue-800">{action}</span>}
        </p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {footer && <p className="text-xs text-gray-500 mt-1">{footer}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} ariaLabel={title} />
    </Card>
  );
}
