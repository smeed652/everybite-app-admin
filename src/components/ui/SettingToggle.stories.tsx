import type { Meta, StoryObj } from '@storybook/react';
import { SettingToggle } from './SettingToggle';

const meta: Meta<typeof SettingToggle> = {
  title: 'UI/Misc/SettingToggle',
  component: SettingToggle,
};
export default meta;

type Story = StoryObj<typeof SettingToggle>;

export const Default: Story = {
  args: {},
};
