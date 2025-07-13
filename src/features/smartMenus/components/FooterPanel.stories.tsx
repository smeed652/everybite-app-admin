import type { Meta, StoryObj } from '@storybook/react';
import { FooterPanel } from './FooterPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof FooterPanel> = {
  title: 'UI/Misc/FooterPanel',
  component: FooterPanel,
};
export default meta;

type Story = StoryObj<typeof FooterPanel>;

export const Default: Story = {
  args: {
    widget: { ...(makeWidget() as any), displayFooter: true, footerText: 'Sample footer' } as any,
    onFieldChange: () => {},
  },
};
