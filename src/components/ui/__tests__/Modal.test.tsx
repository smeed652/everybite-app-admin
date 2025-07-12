import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders title and children when open', () => {
    const handle = vi.fn();
    render(
      <Modal open onOpenChange={handle} title="Confirm">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole('heading', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) on Escape key', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(
      <Modal open onOpenChange={handle} title="Test">
        <p>Content</p>
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(handle).toHaveBeenCalledWith(false);
  });
});
