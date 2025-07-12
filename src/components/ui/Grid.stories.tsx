import type { Meta, StoryObj } from '@storybook/react-vite';
import Grid from './Grid';

const meta = {
  title: 'UI/Grid',
  component: Grid,
  tags: ['autodocs'],
  args: {
    cols: 3,
    gap: 4,
    children: Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="p-4 rounded bg-gray-100 text-center">
        Cell {i + 1}
      </div>
    )),
  },
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
