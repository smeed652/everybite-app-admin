import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveTextContent('Content');
  });

  it('forwards custom className', () => {
    const { container } = render(<Card className="bg-red-500" />);
    expect(container.firstChild).toHaveClass('bg-red-500');
  });
});
