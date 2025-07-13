import type { Meta, StoryObj } from '@storybook/react';
import { MarketingPanel } from './MarketingPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof MarketingPanel> = {
  title: 'UI/Misc/MarketingPanel',
  component: MarketingPanel,
};
export default meta;

type Story = StoryObj<typeof MarketingPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as unknown as any,
    onFieldChange: () => {},
  },
};
