import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Panel } from '../Panel';

// simple child stub
function Body() {
  return <p data-testid="panel-body">Body</p>;
}

describe('Panel', () => {
  it('renders title and children', () => {
    render(<Panel title="Hello"><Body /></Panel>);
    expect(screen.getByRole('heading', { name: /hello/i })).toBeInTheDocument();
    expect(screen.getByTestId('panel-body')).toBeInTheDocument();
  });

  it('renders optional description', () => {
    render(<Panel title="T" description="Desc"><Body /></Panel>);
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('renders header actions', () => {
    render(<Panel title="T" actions={<button>Act</button>}><Body /></Panel>);
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });

  it('applies stickyHeader class when enabled', () => {
    render(<Panel title="Sticky" stickyHeader><Body /></Panel>);
    const heading = screen.getByRole('heading', { name: /sticky/i });
    const header = heading.closest('header');
    expect(header).toBeTruthy();
    expect(header!.className).toMatch(/sticky/);
  });
});
