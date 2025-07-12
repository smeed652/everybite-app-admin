import type { Meta, StoryObj } from '@storybook/react-vite';
import AppContent from '../layout/AppContent';

const meta: Meta<typeof AppContent> = {
  title: 'Layout/AppContent',
  component: AppContent,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof AppContent>;

export const Default: Story = {
  render: () => (
    <AppContent>
      <div className="p-8 space-y-4 h-[2000px] bg-muted/20">
        <p>Scrollable area inside AppContent</p>
        <p className="text-sm text-muted-foreground">Scroll to verify only the inner region scrolls.</p>
      </div>
    </AppContent>
  ),
};
