import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';
import { Modal } from './Modal';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'UI/Overlay/Modal',
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof meta>;

function Demo(props: { size?: 'sm' | 'lg' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal open={open} onOpenChange={setOpen} title="Demo Modal" description="Modal description">
        <p className="text-sm">Body content</p>
      </Modal>
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: /open modal/i }));
  await expect(canvas.getByRole('dialog')).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
};
