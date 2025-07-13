import type { Meta, StoryObj } from '@storybook/react';
import { HostedPageBrandingPanel } from './HostedPageBrandingPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof HostedPageBrandingPanel> = {
  title: 'UI/Misc/HostedPageBrandingPanel',
  component: HostedPageBrandingPanel,
};
export default meta;

type Story = StoryObj<typeof HostedPageBrandingPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as any,
    onFieldChange: () => {},
  },
};
