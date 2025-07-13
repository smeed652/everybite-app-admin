import type { Meta, StoryObj } from '@storybook/react';
import { TitleSection } from './TitleSection';

const meta: Meta<typeof TitleSection> = {
  title: 'UI/Misc/TitleSection',
  component: TitleSection,
};
export default meta;

type Story = StoryObj<typeof TitleSection>;

export const Default: Story = {
  args: {},
};
