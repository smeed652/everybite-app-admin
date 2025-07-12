/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Overlay/Modal',
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Example Modal" description="Short description here">
          <p className="text-sm">Hello from inside the modal!</p>
        </Modal>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Modal open={open} onOpenChange={setOpen} title="Scrollable">
        {Array.from({ length: 50 }).map((_, i) => (
          <p key={i}>Line {i + 1}</p>
        ))}
      </Modal>
    );
  },
};
