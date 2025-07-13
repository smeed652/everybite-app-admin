import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Card } from './Card';

const meta = {
  title: 'UI/Layout/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    children: <div className="p-6">Card content</div>,
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shadow: Story = {
  args: {
    children: <div className="p-6">Shadow variant</div>,
    className: 'shadow-lg',
  },
};

export const Borderless: Story = {
  args: {
    children: <div className="p-6">Borderless variant</div>,
    className: 'border-0',
  },
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText('Card content')).toBeInTheDocument();
};
