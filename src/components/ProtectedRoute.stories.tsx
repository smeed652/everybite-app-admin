import type { Meta, StoryObj } from '@storybook/react';
import { ProtectedRoute } from './ProtectedRoute';

const meta: Meta<typeof ProtectedRoute> = {
  title: 'UI/Misc/ProtectedRoute',
  component: ProtectedRoute,
};
export default meta;

type Story = StoryObj<typeof ProtectedRoute>;

export const Default: Story = {
  args: {},
};
