import type { Meta, StoryObj } from '@storybook/react-vite';
import Section from './Section';

const meta = {
  title: 'UI/Section',
  component: Section,
  tags: ['autodocs'],
  args: {
    title: 'Profile Information',
    description: 'Group of settings related to the user profile',
    children: <p className="text-sm">Section body content goes here.</p>,
  },
} satisfies Meta<typeof Section>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
