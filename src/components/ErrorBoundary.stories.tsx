import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'UI/Misc/ErrorBoundary',
  component: ErrorBoundary,
};
export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  args: {},
};
