import type { Meta, StoryObj } from '@storybook/react';
import { ColorRow } from './ColorRow';

const meta: Meta<typeof ColorRow> = {
  title: 'UI/Data Display/ColorRow',
  component: ColorRow,
};
export default meta;

type Story = StoryObj<typeof ColorRow>;

export const Default: Story = {
  args: {
    label: 'Primary Color',
    value: '#ff0000',
    onChange: () => {},
  },
};
