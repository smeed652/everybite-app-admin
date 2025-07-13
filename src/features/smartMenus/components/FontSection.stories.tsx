import type { Meta, StoryObj } from '@storybook/react';
import { FontSection } from './FontSection';

const meta: Meta<typeof FontSection> = {
  title: 'UI/Misc/FontSection',
  component: FontSection,
};
export default meta;

type Story = StoryObj<typeof FontSection>;

export const Default: Story = {
  args: {
    fonts: ['Inter', 'Roboto', 'Open Sans'],
    navbarFont: 'Inter',
    onNavbarFontChange: () => {},
    navbarFontSize: '16',
    onNavbarFontSizeChange: () => {},
    navbarBg: '#ffffff',
    onNavbarBgChange: () => {},
  },
};
