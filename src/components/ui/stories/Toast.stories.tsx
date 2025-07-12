/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { ToastProvider, useToast } from '../ToastProvider';

const meta: Meta = {
  title: 'UI/Overlay/Toast',
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  ),
};

function Inner() {
  const { showToast } = useToast();
  return (
    <div className="space-x-2">
      <Button onClick={() => showToast({ title: 'Saved!', variant: 'success' })}>Success</Button>
      <Button onClick={() => showToast({ title: 'Error', variant: 'error' })}>Error</Button>
    </div>
  );
}
