import type { Meta, StoryObj } from '@storybook/react';
import { OrderingSection } from './OrderingSection';

const meta: Meta<typeof OrderingSection> = {
  title: 'UI/Misc/OrderingSection',
  component: OrderingSection,
};
export default meta;

type Story = StoryObj<typeof OrderingSection>;

export const Default: Story = {
  args: {},
};
