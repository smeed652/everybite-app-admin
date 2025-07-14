import type { Meta, StoryObj } from '@storybook/react';
import { DietarySection } from './DietarySection';

const meta: Meta<typeof DietarySection> = {
  title: 'UI/Misc/DietarySection',
  component: DietarySection,
};
export default meta;

type Story = StoryObj<typeof DietarySection>;

export const Default: Story = {
  args: {
    dietOptions: ['VEGAN', 'VEGETARIAN'] as any[],
    enableDiets: true,
    onToggleDiets: () => {},
    selectedDiets: ['VEGAN'] as any[],
    onChangeSelectedDiets: () => {},
    enableIngredients: true,
    onToggleIngredients: () => {},
  },
};
