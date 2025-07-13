import type { Meta, StoryObj } from '@storybook/react';
import { MetricsCard } from './MetricsCard';

const meta: Meta<typeof MetricsCard> = {
  title: 'UI/Misc/MetricsCard',
  component: MetricsCard,
};
export default meta;

type Story = StoryObj<typeof MetricsCard>;

export const Default: Story = {
  args: {},
};
