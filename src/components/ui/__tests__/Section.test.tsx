import { render, screen } from '@testing-library/react';
import Section from '../Section';

describe('Section', () => {
  it('renders title, description and children', () => {
    render(
      <Section title="My Section" description="Some details">
        <div data-testid="child">Hello</div>
      </Section>,
    );

    expect(screen.getByRole('heading', { name: /my section/i })).toBeInTheDocument();
    expect(screen.getByText(/some details/i)).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });
});
