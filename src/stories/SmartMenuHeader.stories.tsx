/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react-vite';
import SmartMenuHeader from '../features/smartMenus/components/SmartMenuHeader';
import type { Widget } from '../generated/graphql';

// --- mock widget -----------------------------------------------------------
const mockWidget: Widget = {
  id: 'b41a098c',
  name: 'Honeygrow – Ordering',
  slug: 'honeygrow-ordering',
  isActive: true,
  updatedAt: new Date('2024-07-11').toISOString(),
  publishedAt: null,
  // add unused fields as empty or null to satisfy type; cast as any to avoid excess.
} as any;

// ---------------------------------------------------------------------------
const meta: Meta<typeof SmartMenuHeader> = {
  title: 'SmartMenus/SmartMenuHeader',
  component: SmartMenuHeader,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof SmartMenuHeader>;

export const Default: Story = {
  args: {
    widget: mockWidget,
    dirty: false,
  },
};
