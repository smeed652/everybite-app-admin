import { render } from '@testing-library/react';
import Grid from '../Grid';

describe('Grid', () => {
  it('applies numeric cols prop as Tailwind class', () => {
    const { container } = render(
      <Grid cols={5}>
        <div>1</div>
        <div>2</div>
      </Grid>,
    );
    expect(container.firstChild).toHaveClass('grid', 'grid-cols-5', 'gap-4');
  });

  it('supports custom template string via inline style', () => {
    const template = 'repeat(auto-fill,minmax(100px,1fr))';
    const { container } = render(
      <Grid cols={template} gap={2}>
        <div />
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ gridTemplateColumns: template });
    expect(el).toHaveClass('gap-2');
  });
});
