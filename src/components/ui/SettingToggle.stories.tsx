import type { Meta, StoryObj } from '@storybook/react';
import { SettingToggle } from './SettingToggle';
import { useState } from 'react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Bell } from 'lucide-react';

const meta: Meta<typeof SettingToggle> = {
  title: 'UI/Misc/SettingToggle',
  component: SettingToggle,
};
export default meta;

type Story = StoryObj<typeof meta>;

function Demo({ disabled = false }: { disabled?: boolean }) {
  const [checked, setChecked] = useState(false);
  return (
    <SettingToggle
      icon={<Bell className="h-4 w-4" />}
      title="Notifications"
      description="Enable email notifications"
      checked={checked}
      onChange={setChecked}
      disabled={disabled}
      action={<span>Learn more</span>}
    />
  );
}

export const Enabled: Story = {
  render: () => <Demo />,
};

export const Disabled: Story = {
  render: () => <Demo disabled />,
};

Enabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const toggle = await canvas.findByRole('switch');
  await expect(toggle).not.toBeChecked();
  await userEvent.click(toggle);
  await expect(toggle).toBeChecked();
};
