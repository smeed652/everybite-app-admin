import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingToggle } from '../ui/SettingToggle';

/**
 * Simple unit coverage for the reusable SettingToggle component.
 * Ensures it renders props correctly and propagates toggle state changes.
 */

describe('SettingToggle', () => {
  it('renders title & description and reflects checked prop', () => {
    render(
      <SettingToggle
        title="Enable Sauce"
        description="Adds secret sauce to every burger."
        checked={true}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Enable Sauce')).toBeInTheDocument();
    expect(screen.getByText('Adds secret sauce to every burger.')).toBeInTheDocument();

    const checkbox = screen.getByRole('switch');
    expect(checkbox).toBeChecked();
  });

  it('invokes onChange with toggled value when clicked', () => {
    const handleChange = vi.fn();
    render(
      <SettingToggle
        title="Enable Topping"
        checked={false}
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByRole('switch');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    // Should be called once with the toggled value 'true'
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
