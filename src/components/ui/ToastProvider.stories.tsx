import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from './ToastProvider';

const meta: Meta<typeof ToastProvider> = {
  title: 'UI/Overlay/ToastProvider',
  component: ToastProvider,
};
export default meta;

type Story = StoryObj<typeof ToastProvider>;

export const Default: Story = {
  args: {},
};
