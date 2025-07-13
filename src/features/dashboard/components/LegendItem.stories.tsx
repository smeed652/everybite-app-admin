import type { Meta, StoryObj } from '@storybook/react';
import { LegendItem } from './LegendItem';

const meta: Meta<typeof LegendItem> = {
  title: 'UI/Data Display/LegendItem',
  component: LegendItem,
};
export default meta;

type Story = StoryObj<typeof LegendItem>;

export const Default: Story = {
  args: {},
};
