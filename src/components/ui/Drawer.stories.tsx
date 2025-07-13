import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { useState } from 'react';
import { expect } from '@storybook/jest';
import { userEvent, within, screen } from '@storybook/testing-library';

const meta: Meta<typeof Drawer> = {
  title: 'UI/Overlay/Drawer',
  component: Drawer,
};
export default meta;

type Story = StoryObj<typeof meta>;

function Demo({ side = 'right' }: { side?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <Drawer open={open} onOpenChange={setOpen} side={side} title="Demo Drawer">
        <p className="text-sm">Drawer body</p>
      </Drawer>
    </div>
  );
}

export const RightSide: Story = {
  render: () => <Demo side="right" />,
};

export const LeftSide: Story = {
  render: () => <Demo side="left" />,
};

RightSide.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
  const dialog = await screen.findByRole('dialog');
  await expect(dialog).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
};
