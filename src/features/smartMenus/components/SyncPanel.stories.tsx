import type { Meta, StoryObj } from '@storybook/react';
import { SyncPanel } from './SyncPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof SyncPanel> = {
  title: 'UI/Misc/SyncPanel',
  component: SyncPanel,
};
export default meta;

type Story = StoryObj<typeof SyncPanel>;

export const Default: Story = {
  args: {
    widget: { ...(makeWidget() as any), isSyncEnabled: true } as any,
    onFieldChange: () => {},
  },
};
