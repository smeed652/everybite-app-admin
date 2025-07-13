import type { Meta, StoryObj } from '@storybook/react';
import { ConcentricDonutChart } from './ConcentricDonutChart';

const meta: Meta<typeof ConcentricDonutChart> = {
  title: 'UI/Data Display/ConcentricDonutChart',
  component: ConcentricDonutChart,
};
export default meta;

type Story = StoryObj<typeof ConcentricDonutChart>;

export const Default: Story = {
  args: {},
};
