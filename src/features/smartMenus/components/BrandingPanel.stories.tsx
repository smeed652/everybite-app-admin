import type { Meta, StoryObj } from '@storybook/react';
import { BrandingPanel } from './BrandingPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof BrandingPanel> = {
  title: 'UI/Misc/BrandingPanel',
  component: BrandingPanel,
};
export default meta;

type Story = StoryObj<typeof BrandingPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as unknown as any,
    onFieldChange: () => {},
  },
};
