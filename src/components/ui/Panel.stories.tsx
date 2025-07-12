import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from './Panel';
import { Button } from './Button';

const meta = {
  title: 'UI/Panel',
  component: Panel,
  tags: ['autodocs'],
  args: {
    children: (
      <p className="text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.
      </p>
    ),
  },
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Panel Title',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Panel Title',
    description: 'Short explanation about this panel.',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Panel Title',
    actions: <Button size="sm">Action</Button>,
  },
};

export const StickyHeader: Story = {
  args: {
    title: 'Panel Title',
    stickyHeader: true,
    children: (
      <div className="space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Scrollable content line {i + 1}</p>
        ))}
      </div>
    ),
  },
};
