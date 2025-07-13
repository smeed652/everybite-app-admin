import type { Meta, StoryObj } from '@storybook/react';
import { TrendsChart } from './TrendsChart';

const meta: Meta<typeof TrendsChart> = {
  title: 'UI/Data Display/TrendsChart',
  component: TrendsChart,
};
export default meta;

type Story = StoryObj<typeof TrendsChart>;

export const Default: Story = {
  args: {},
};
