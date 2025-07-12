import { render, screen } from '@testing-library/react';
import FormField from '../FormField';
import { Input } from '../Input';

describe('FormField', () => {
  it('renders label, description, and child input', () => {
    render(
      <FormField label="First Name" description="Your given name">
        <Input defaultValue="Joe" />
      </FormField>,
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByText(/your given name/i)).toBeInTheDocument();
  });

  it('appends required asterisk and sets aria-invalid on error', () => {
    render(
      <FormField label="Email" error="Required" required>
        <Input />
      </FormField>,
    );

    const label = screen.getByText(/email/i);
    expect(label).toHaveTextContent('*');
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
