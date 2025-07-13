import type { Meta, StoryObj } from '@storybook/react';
import { ResourceHeader } from './ResourceHeader';

const meta: Meta<typeof ResourceHeader> = {
  title: 'UI/Misc/ResourceHeader',
  component: ResourceHeader,
};
export default meta;

type Story = StoryObj<typeof ResourceHeader>;

export const Default: Story = {
  args: { level: 2, title: 'Resource Header' },
};
