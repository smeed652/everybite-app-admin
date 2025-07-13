import type { Meta, StoryObj } from '@storybook/react';
import { ContentSection } from './ContentSection';

const meta: Meta<typeof ContentSection> = {
  title: 'UI/Misc/ContentSection',
  component: ContentSection,
};
export default meta;

type Story = StoryObj<typeof ContentSection>;

export const Default: Story = {
  args: {
    contentGlobalColor: '#000000',
    onGlobalColorChange: () => {},
    contentHeaderColor: '#333333',
    onHeaderColorChange: () => {},
    fonts: ['Roboto', 'Open Sans', 'Inter'],
    categoryFont: 'Roboto',
    onCategoryFontChange: () => {},
    categoryColor: '#666666',
    onCategoryColorChange: () => {},
  },
};
