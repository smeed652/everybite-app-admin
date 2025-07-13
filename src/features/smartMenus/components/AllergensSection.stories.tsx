import type { Meta, StoryObj } from '@storybook/react';
import { AllergensSection } from './AllergensSection';

const meta: Meta<typeof AllergensSection> = {
  title: 'UI/Misc/AllergensSection',
  component: AllergensSection,
};
export default meta;

type Story = StoryObj<typeof AllergensSection>;

export const Default: Story = {
  args: {},
};
