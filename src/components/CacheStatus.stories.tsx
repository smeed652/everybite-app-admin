import type { Meta, StoryObj } from "@storybook/react";
import { CacheStatus } from "./CacheStatus";

const meta: Meta<typeof CacheStatus> = {
  title: "Components/CacheStatus",
  component: CacheStatus,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCachedData: Story = {
  args: {},
  parameters: {
    mockData: {
      // Mock localStorage data for testing
      localStorage: {
        "metabase-apollo-cache-QuarterlyMetrics": JSON.stringify({
          data: { quarterlyMetrics: [] },
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        }),
        "metabase-apollo-cache-WidgetAnalytics": JSON.stringify({
          data: { widgetAnalytics: {} },
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        }),
      },
    },
  },
};

export const WithStaleData: Story = {
  args: {},
  parameters: {
    mockData: {
      localStorage: {
        "metabase-apollo-cache-QuarterlyMetrics": JSON.stringify({
          data: { quarterlyMetrics: [] },
          timestamp: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago (stale)
        }),
        "metabase-apollo-cache-WidgetAnalytics": JSON.stringify({
          data: { widgetAnalytics: {} },
          timestamp: Date.now() - 1000 * 60 * 60 * 30, // 30 hours ago (stale)
        }),
      },
    },
  },
};
