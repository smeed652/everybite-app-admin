import type { Meta, StoryObj } from '@storybook/react';
import { SmartMenuHeader } from './SmartMenuHeader';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof SmartMenuHeader> = {
  title: 'UI/Misc/SmartMenuHeader',
  component: SmartMenuHeader,
};
export default meta;

type Story = StoryObj<typeof SmartMenuHeader>;

export const Default: Story = {
  args: {
    widget: {
      ...makeWidget(),
      lastSyncedAt: new Date().toISOString(),
    } as any,
    dirty: true,
    headingLevel: 1,
    onSave: () => {},
    onCancel: () => {},
  },
};
