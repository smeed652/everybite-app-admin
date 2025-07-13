import type { Meta, StoryObj } from '@storybook/react';
import { DietarySection } from './DietarySection';

const meta: Meta<typeof DietarySection> = {
  title: 'UI/Misc/DietarySection',
  component: DietarySection,
};
export default meta;

type Story = StoryObj<typeof DietarySection>;

export const Default: Story = {
  args: {},
};
