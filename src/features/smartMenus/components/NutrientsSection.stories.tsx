import type { Meta, StoryObj } from '@storybook/react';
import { NutrientsSection } from './NutrientsSection';

const meta: Meta<typeof NutrientsSection> = {
  title: 'UI/Misc/NutrientsSection',
  component: NutrientsSection,
};
export default meta;

type Story = StoryObj<typeof NutrientsSection>;

export const Default: Story = {
  args: {},
};
