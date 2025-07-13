import type { Meta, StoryObj } from '@storybook/react';
import { FeaturesPanel } from './FeaturesPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof FeaturesPanel> = {
  title: 'UI/Misc/FeaturesPanel',
  component: FeaturesPanel,
};
export default meta;

type Story = StoryObj<typeof FeaturesPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as any,
    onFieldChange: () => {},
  },
};
