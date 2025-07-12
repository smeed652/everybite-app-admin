import { ReactNode } from 'react';
import Section from './Section';

interface Props {
  /** Section heading */
  title: ReactNode;
  /** Optional description shown under heading */
  description?: ReactNode;
  /** Field rows */
  children: ReactNode;
  /** Extra classes */
  className?: string;
}

/**
 * FormSection – composition of Section that spaces form fields consistently.
 * Intended to be nested inside pages/panels to group related fields.
 */
export default function FormSection({ title, description, children, className = '' }: Props) {
  return (
    <Section title={title} description={description} className={className}>
      <div className="space-y-6">{children}</div>
    </Section>
  );
}
