import type { Meta, StoryObj } from '@storybook/react';
import { DesignPanel } from './DesignPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof DesignPanel> = {
  title: 'UI/Misc/DesignPanel',
  component: DesignPanel,
};
export default meta;

type Story = StoryObj<typeof DesignPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as any,
    onFieldChange: () => {},
  },
};
