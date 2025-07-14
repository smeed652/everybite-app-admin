import type { Meta, StoryObj } from '@storybook/react';
import { OptionToggleSection } from './OptionToggleSection';
import { Leaf } from 'lucide-react';

const OPTIONS = ['VEGETARIAN', 'VEGAN', 'PESCATARIAN'] as const;

const meta: Meta<typeof OptionToggleSection<any>> = {
  title: 'UI/Misc/OptionToggleSection',
  component: OptionToggleSection,
  args: {
    icon: <Leaf aria-hidden="true" className="h-4 w-4" />,
    title: 'Dietary Preferences',
    description: 'Enable diet filters (select at least one diet when enabled)',
    enabled: true,
    options: OPTIONS,
    selected: ['VEGAN'],
  },
  argTypes: {
    enabled: { control: 'boolean' },
    selected: { control: 'check', options: OPTIONS },
  },
};
export default meta;

type Story = StoryObj<typeof OptionToggleSection<any>>;

export const Default: Story = {
  render: (args) => (
    <OptionToggleSection<any>
      {...args}
      onToggleEnabled={() => {}}
      onChangeSelected={() => {}}
    />
  ),
};
