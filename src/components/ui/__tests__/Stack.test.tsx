import { render } from '@testing-library/react';
import Stack from '../Stack';

describe('Stack', () => {
  it('renders vertical stack by default', () => {
    const { container } = render(
      <Stack>
        <span>one</span>
        <span>two</span>
      </Stack>,
    );

    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-4');
  });

  it('renders horizontal stack when horizontal prop is true', () => {
    const { container } = render(
      <Stack horizontal gap={2}>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );

    expect(container.firstChild).toHaveClass('flex-row', 'gap-2');
  });
});
