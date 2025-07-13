import type { Meta, StoryObj } from '@storybook/react';
import { DonutStatCard } from './DonutStatCard';

const meta: Meta<typeof DonutStatCard> = {
  title: 'UI/Data Display/DonutStatCard',
  component: DonutStatCard,
};
export default meta;

type Story = StoryObj<typeof DonutStatCard>;

export const Default: Story = {
  args: {},
};
