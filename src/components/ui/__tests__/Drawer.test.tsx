import { render, screen } from '@testing-library/react';
import { Drawer } from '../Drawer';

describe('Drawer', () => {
  it('renders children when open', () => {
    const handle = vi.fn();
    render(
      <Drawer open onOpenChange={handle} title="Nav">
        <p>Inside</p>
      </Drawer>,
    );
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('renders from left side when side="left"', () => {
    const handle = vi.fn();
    render(
      <Drawer open onOpenChange={handle} side="left" title="Left">
        <p>Left Drawer</p>
      </Drawer>,
    );
    // Expect content exists
    expect(screen.getByText('Left Drawer')).toBeInTheDocument();
  });
});
