import type { Meta, StoryObj } from '@storybook/react';
import { LogoSection } from './LogoSection';

const meta: Meta<typeof LogoSection> = {
  title: 'UI/Misc/LogoSection',
  component: LogoSection,
};
export default meta;

type Story = StoryObj<typeof LogoSection>;

export const Default: Story = {
  args: {},
};
