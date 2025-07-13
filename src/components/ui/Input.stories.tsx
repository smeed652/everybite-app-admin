import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Mail } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Inputs/Input',
  component: Input,
  args: {
    placeholder: 'Type here',
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = await canvas.getByPlaceholderText(/type here/i);
  await userEvent.type(input, 'hello');
  expect((input as HTMLInputElement).value).toBe('hello');
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input className="pl-9" {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Error: Story = {
  render: (args) => (
    <div className="space-y-1">
      <Input aria-invalid {...args} className="border-destructive focus-visible:ring-destructive" />
      <p className="text-xs text-destructive">This field is required</p>
    </div>
  ),
};
