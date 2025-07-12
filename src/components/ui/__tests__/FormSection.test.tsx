import { render, screen } from '@testing-library/react';
import FormSection from '../FormSection';
import FormField from '../FormField';
import { Input } from '../Input';

describe('FormSection', () => {
  it('renders title, description and children fields', () => {
    render(
      <FormSection title="Profile" description="Update your info">
        <FormField label="First Name">
          <Input />
        </FormField>
      </FormSection>,
    );

    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByText(/update your info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });
});
