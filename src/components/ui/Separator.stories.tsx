import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Layout/Separator',
  component: Separator,
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  args: {},
};
