import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    children: <div className="p-6">Card content</div>,
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
