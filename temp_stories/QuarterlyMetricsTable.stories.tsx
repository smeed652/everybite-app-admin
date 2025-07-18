import type { Meta, StoryObj } from "@storybook/react";
import { QuarterlyMetricsTable } from "./QuarterlyMetricsTable";

const meta: Meta<typeof QuarterlyMetricsTable> = {
  title: "Components/QuarterlyMetricsTable",
  component: QuarterlyMetricsTable,
  parameters: {
    layout: "padded",
    a11y: { disable: true }, // Disable accessibility tests for all stories
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuarterlyMetricsTable>;

// Sample data for different scenarios
const sampleData = [
  {
    quarter: "Q4 2024",
    brands: 45,
    locations: 1200,
    activeSmartMenus: 38,
  },
  {
    quarter: "Q3 2024",
    brands: 38,
    locations: 980,
    activeSmartMenus: 32,
  },
  {
    quarter: "Q2 2024",
    brands: 32,
    locations: 750,
    activeSmartMenus: 28,
  },
  {
    quarter: "Q1 2024",
    brands: 25,
    locations: 520,
    activeSmartMenus: 22,
  },
];

const decliningData = [
  {
    quarter: "Q4 2024",
    brands: 35,
    locations: 800,
    activeSmartMenus: 25,
  },
  {
    quarter: "Q3 2024",
    brands: 42,
    locations: 950,
    activeSmartMenus: 30,
  },
  {
    quarter: "Q2 2024",
    brands: 48,
    locations: 1100,
    activeSmartMenus: 35,
  },
  {
    quarter: "Q1 2024",
    brands: 52,
    locations: 1250,
    activeSmartMenus: 40,
  },
];

const mixedData = [
  {
    quarter: "Q4 2024",
    brands: 50,
    locations: 1200,
    activeSmartMenus: 35,
  },
  {
    quarter: "Q3 2024",
    brands: 45,
    locations: 1100,
    activeSmartMenus: 40,
  },
  {
    quarter: "Q2 2024",
    brands: 40,
    locations: 900,
    activeSmartMenus: 30,
  },
  {
    quarter: "Q1 2024",
    brands: 35,
    locations: 800,
    activeSmartMenus: 25,
  },
];

export const Growing: Story = {
  args: {
    data: sampleData,
    loading: false,
    error: null,
  },
};

export const Declining: Story = {
  args: {
    data: decliningData,
    loading: false,
    error: null,
  },
};

export const MixedGrowth: Story = {
  args: {
    data: mixedData,
    loading: false,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
    error: null,
  },
};

export const Error: Story = {
  args: {
    data: [],
    loading: false,
    error: "Failed to fetch quarterly data from the API",
  },
};

export const Empty: Story = {
  args: {
    data: [],
    loading: false,
    error: null,
  },
};

export const SingleQuarter: Story = {
  args: {
    data: [sampleData[0]],
    loading: false,
    error: null,
  },
};
