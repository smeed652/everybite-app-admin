import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'UI/Inputs/Label',
  component: Label,
  args: {
    children: 'Email',
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} htmlFor="email" />
      <input id="email" type="email" className="border p-1" />
    </div>
  ),
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const label = await canvas.getByText(/email/i);
  expect(label.tagName.toLowerCase()).toBe('label');
};

export const Required: Story = {
  args: {
    children: (
      <>
        Email <span className="text-red-600" aria-hidden>*</span>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    className: 'opacity-50 cursor-not-allowed',
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} htmlFor="email-disabled" />
      <input id="email-disabled" type="email" className="border p-1" disabled aria-label="Email" />
    </div>
  ),
};
