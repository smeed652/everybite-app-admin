import type { Meta, StoryObj } from '@storybook/react-vite';
import ResourceHeader from '../components/ResourceHeader';

const meta: Meta<typeof ResourceHeader> = {
  title: 'Layout/ResourceHeader',
  component: ResourceHeader,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof ResourceHeader>;

export const Default: Story = {
  args: {
    title: 'Sample Resource',
    meta: [
      { label: 'ID', value: 'abc123' },
      { label: 'Status', value: <span className="text-green-600">ACTIVE</span> },
    ],
  },
};
