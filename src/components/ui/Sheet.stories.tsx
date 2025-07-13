import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'UI/Overlay/Sheet',
  component: Sheet,
};
export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  args: {},
};
