import type { Meta, StoryObj } from '@storybook/react';
import { BasicPanel } from './BasicPanel';
import { makeWidget } from '../../../__tests__/factories/widget';

const meta: Meta<typeof BasicPanel> = {
  title: 'UI/Misc/BasicPanel',
  component: BasicPanel,
};
export default meta;

type Story = StoryObj<typeof BasicPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as unknown as any,
    onFieldChange: () => {},
  },
};
