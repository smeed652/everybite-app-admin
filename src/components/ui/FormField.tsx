import { ReactNode, cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  /** Visible label text */
  label: ReactNode;
  /** Input element to be rendered */
  children: React.ReactElement;
  /** Optional description or hint shown under the input */
  description?: ReactNode;
  /** Optional error message; if present, input borders turn red */
  error?: ReactNode;
  /** Mark the field as required and append * to the label */
  required?: boolean;
  /** Optional id; defaults to child's id or auto-generated */
  id?: string;
  /** Extra utility classes on the wrapper */
  className?: string;
}

let autoId = 0;

export default function FormField({
  label,
  children,
  description,
  error,
  required = false,
  id: idProp,
  className = '',
}: Props) {
  if (!isValidElement(children)) throw new Error('FormField: children must be a single React element');

  const id = idProp || (children.props.id as string) || `field-${++autoId}`;
  const describedByIds: string[] = [];
  if (description) describedByIds.push(`${id}-desc`);
  if (error) describedByIds.push(`${id}-err`);
  const ariaDescribedBy = describedByIds.join(' ') || undefined;

  const inputEl = cloneElement(children, {
    id,
    'aria-invalid': !!error,
    'aria-describedby': ariaDescribedBy,
    className: cn(
      children.props.className,
      error ? 'border-red-500 focus:ring-red-500' : '',
    ),
  });

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {inputEl}
      {description && (
        <p id={`${id}-desc`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
