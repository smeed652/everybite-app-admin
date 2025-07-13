import type { Meta, StoryObj } from '@storybook/react';
import { Prose } from './Prose';

const meta: Meta<typeof Prose> = {
  title: 'UI/Layout/Prose',
  component: Prose,
};
export default meta;

type Story = StoryObj<typeof Prose>;

export const Default: Story = {
  args: {},
};
