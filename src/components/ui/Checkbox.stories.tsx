import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Inputs/Checkbox',
  component: Checkbox,
  args: {},
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

const Template = (args: React.ComponentProps<typeof Checkbox>) => (
  <label className="inline-flex items-center gap-2">
    <Checkbox {...args} ariaLabel="Checkbox" />
    <span className="sr-only">Checkbox</span>
  </label>
);

export const Default: Story = {
  render: Template,
};

export const Checked: Story = {
  args: { defaultChecked: true, ariaLabel: 'Checkbox checked' },
  render: Template,
};

export const Disabled: Story = {
  args: { disabled: true, ariaLabel: 'Checkbox disabled' },
  render: Template,
};

export const Indeterminate: Story = {
  // Using hooks inside a wrapper component to satisfy ESLint react-hooks rules
  render: (args) => {
    const IndeterminateCheckbox: React.FC<typeof args> = (props) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const ref = React.useRef<HTMLInputElement>(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useEffect(() => {
        if (ref.current) {
          // Manually mark input as indeterminate
          (ref.current as HTMLInputElement).indeterminate = true;
        }
      }, []);
      // Cast to any to avoid ref-type mismatch warnings
      return <Checkbox ref={ref as any} {...props} />;
    };
    return (
        <label className="inline-flex items-center gap-2">
          <label className="inline-flex items-center gap-2">
          <IndeterminateCheckbox {...args} ariaLabel="Checkbox indeterminate" />
          <span className="sr-only">Indeterminate</span>
        </label>
          <span>Indeterminate</span>
        </label>
      );
  },
};