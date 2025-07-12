import type { Meta, StoryObj } from '@storybook/react-vite';
import FormSection from './FormSection';
import FormField from './FormField';
import { Input } from './Input';

const meta = {
  title: 'Forms/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  args: {
    title: 'Profile Information',
    description: 'Update your personal details below.',
    children: (
      <>
        <FormField label="First Name" required>
          <Input placeholder="Jane" />
        </FormField>
        <FormField label="Last Name" required>
          <Input placeholder="Doe" />
        </FormField>
        <FormField label="Bio" description="A short description about you.">
          <Input placeholder="Software engineer at ..." />
        </FormField>
      </>
    ),
  },
} satisfies Meta<typeof FormSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
