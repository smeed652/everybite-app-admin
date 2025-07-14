/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import SmartMenuHeader from './SmartMenuHeader';
import { Widget } from '../../../generated/graphql';
import { vi } from 'vitest';

// Helper: construct minimal widget object
const makeWidget = (overrides: Partial<Widget> = {}): Widget => ({
  id: 'abc123',
  name: 'My Widget',
  slug: 'my-widget',
  isActive: true,
  updatedAt: new Date('2024-01-01').toISOString(),
  publishedAt: new Date('2024-01-02').toISOString(),
  createdAt: new Date('2024-01-03').toISOString(),
  __typename: 'Widget',
  banners: [],
  // allow partial overrides
  ...overrides,
}) as unknown as Widget;

describe('SmartMenuHeader', () => {
  it('renders widget name and status', () => {
    render(<SmartMenuHeader widget={makeWidget()} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/My Widget/);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('disables Save when dirty=false', () => {
    render(
      <SmartMenuHeader widget={makeWidget()} dirty={false} onSave={vi.fn()} />
    );
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toBeDisabled();
  });

  it('enables Save when dirty=true', () => {
    render(
      <SmartMenuHeader widget={makeWidget()} dirty={true} onSave={vi.fn()} />
    );
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toBeEnabled();
  });

  it('calls window.open with correct URL on Preview click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null as any);

    render(<SmartMenuHeader widget={makeWidget()} />);
    const previewBtn = screen.getByRole('button', { name: /preview widget/i });

    fireEvent.click(previewBtn);
    expect(openSpy).toHaveBeenCalledWith('https://app.everybite.com/widget/abc123', '_blank');

    openSpy.mockRestore();
  });
});
