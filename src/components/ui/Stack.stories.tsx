import type { Meta, StoryObj } from '@storybook/react-vite';
import Stack from './Stack';

const meta = {
  title: 'UI/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    gap: 4,
    children: (
      <>
        <div className="p-4 rounded bg-gray-100">Item 1</div>
        <div className="p-4 rounded bg-gray-100">Item 2</div>
        <div className="p-4 rounded bg-gray-100">Item 3</div>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: {
    horizontal: true,
  },
};
