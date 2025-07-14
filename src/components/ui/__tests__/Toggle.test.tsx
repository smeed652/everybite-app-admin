import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('renders as switch with correct checked state', () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    const btn = screen.getByRole('switch');
    expect(btn).toHaveAttribute('aria-checked', 'true');
  });

  it('invokes onChange with toggled value when clicked', () => {
    const spy = vi.fn();
    render(<Toggle checked={false} onChange={spy} />);
    const btn = screen.getByRole('switch');
    fireEvent.click(btn);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', () => {
    const spy = vi.fn();
    render(<Toggle checked={false} onChange={spy} disabled />);
    const btn = screen.getByRole('switch');
    fireEvent.click(btn);
    expect(spy).not.toHaveBeenCalled();
  });
});
