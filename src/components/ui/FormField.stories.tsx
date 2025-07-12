import type { Meta, StoryObj } from '@storybook/react-vite';
import FormField from './FormField';
import { Input } from './Input';

const meta = {
  title: 'Forms/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    description: { control: 'text' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Email',
    description: 'We will never share your email.',
    required: true,
    children: <Input placeholder="john@example.com" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'Email is required',
  },
};
