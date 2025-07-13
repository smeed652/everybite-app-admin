import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptionToggleSection } from '../OptionToggleSection';
import { Leaf } from 'lucide-react';

const OPTIONS = ['VEGETARIAN', 'VEGAN', 'PESCATARIAN'] as const;

describe('OptionToggleSection', () => {
  it('renders title, description and options when enabled', () => {
    render(
      <OptionToggleSection
        icon={<Leaf data-testid="icon" />}
        title="Dietary Preferences"
        description="Enable diet filters"
        options={OPTIONS}
        enabled={true}
        onToggleEnabled={() => {}}
        selected={['VEGAN']}
        onChangeSelected={() => {}}
      />
    );

    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Enable diet filters')).toBeInTheDocument();
    // icon rendered
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    // vegan checkbox checked
    expect(screen.getByLabelText('VEGAN')).toBeChecked();
  });

  it('calls onToggleEnabled when switch clicked', () => {
    const toggleSpy = vi.fn();
    render(
      <OptionToggleSection
        title="Prefs"
        options={OPTIONS}
        enabled={false}
        onToggleEnabled={toggleSpy}
        selected={[]}
        onChangeSelected={() => {}}
      />
    );

    const switchEl = screen.getByRole('switch');
    fireEvent.click(switchEl);
    expect(toggleSpy).toHaveBeenCalledWith(true);
  });

  it('updates selection when checkbox clicked', () => {
    const changeSpy = vi.fn();
    render(
      <OptionToggleSection
        title="Prefs"
        options={OPTIONS}
        enabled={true}
        onToggleEnabled={() => {}}
        selected={[]}
        onChangeSelected={changeSpy}
      />
    );

    const checkbox = screen.getByLabelText('VEGETARIAN');
    fireEvent.click(checkbox);
    expect(changeSpy).toHaveBeenCalledWith(['VEGETARIAN']);
  });

  it('selects all when "Select All" clicked', () => {
    const changeSpy = vi.fn();
    render(
      <OptionToggleSection
        title="Prefs"
        options={OPTIONS}
        enabled={true}
        onToggleEnabled={() => {}}
        selected={[]}
        onChangeSelected={changeSpy}
      />
    );

    const btn = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(btn);
    expect(changeSpy).toHaveBeenCalledWith(OPTIONS as unknown as string[]);
  });
});
