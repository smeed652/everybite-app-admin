import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "../pages/Dashboard";

// Mock the PlayerAnalyticsSection component
vi.mock("../features/dashboard/sections/PlayerAnalyticsSection", () => ({
  PlayerAnalyticsSection: () => (
    <div data-testid="player-analytics">Player Analytics</div>
  ),
}));

// Mock the useSmartMenuSettings hook
vi.mock("../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

import { useSmartMenuSettings } from "../hooks/useSmartMenuSettings";
const mockSmartMenus = [
  {
    id: "1",
    name: "Test Menu 1",
    slug: "test-menu-1",
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-02T10:00:00Z",
    publishedAt: "2024-11-02T10:00:00Z",
    numberOfLocations: 5,
    displayImages: true,
    layout: "CARD",
    isOrderButtonEnabled: true,
    isByoEnabled: false,
  },
  {
    id: "2",
    name: "Test Menu 2",
    slug: "test-menu-2",
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2024-11-15T10:00:00Z",
    publishedAt: null,
    numberOfLocations: 3,
    displayImages: false,
    layout: "TABLE",
    isOrderButtonEnabled: false,
    isByoEnabled: true,
  },
  {
    id: "3",
    name: "Test Menu 3",
    slug: "test-menu-3",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-02T10:00:00Z",
    publishedAt: "2024-12-02T10:00:00Z",
    numberOfLocations: 8,
    displayImages: true,
    layout: "CARD",
    isOrderButtonEnabled: true,
    isByoEnabled: true,
  },
  {
    id: "4",
    name: "Test Menu 4",
    slug: "test-menu-4",
    createdAt: "2024-10-01T10:00:00Z",
    updatedAt: "2024-10-02T10:00:00Z",
    publishedAt: "2024-10-02T10:00:00Z",
    numberOfLocations: 12,
    displayImages: false,
    layout: "TABLE",
    isOrderButtonEnabled: false,
    isByoEnabled: false,
  },
];

const mockQuarterlyMetrics = [
  {
    quarter: 4,
    year: 2024,
    quarterLabel: "Q4 2024",
    orders: {
      count: 150,
      qoqGrowth: 50,
      qoqGrowthPercent: 50.0,
    },
    activeSmartMenus: {
      count: 2,
      qoqGrowth: 1,
      qoqGrowthPercent: 100.0,
    },
    locations: {
      count: 13,
      qoqGrowth: 1,
      qoqGrowthPercent: 8.3,
    },
  },
  {
    quarter: 3,
    year: 2024,
    quarterLabel: "Q3 2024",
    orders: {
      count: 100,
      qoqGrowth: 0,
      qoqGrowthPercent: 0.0,
    },
    activeSmartMenus: {
      count: 1,
      qoqGrowth: 0,
      qoqGrowthPercent: 0.0,
    },
    locations: {
      count: 12,
      qoqGrowth: 0,
      qoqGrowthPercent: 0.0,
    },
  },
];

const mockMetrics = {
  totalSmartMenus: 4,
  activeSmartMenus: 3,
  totalLocations: 28,
  featureAdoption: {
    withImages: 2,
    withOrderButton: 2,
    withByo: 2,
    byLayout: { CARD: 2, TABLE: 2 },
  },
  settings: {
    withCustomColors: 0,
    withCustomFonts: 0,
    withDietaryPreferences: 0,
    withAllergens: 0,
  },
  classifications: {
    nraClassifications: {},
    menuTypes: {},
    cuisineTypes: {},
    orderingEnabled: 2,
    orderingDisabled: 2,
  },
};

// Mock the useSmartMenuSettings hook
vi.mock("../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

const mockUseSmartMenuSettings = useSmartMenuSettings as vi.MockedFunction<
  typeof useSmartMenuSettings
>;

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with metrics", async () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: mockSmartMenus,
      quarterlyMetrics: mockQuarterlyMetrics,
      loading: false,
      error: null,
      metrics: mockMetrics,
      getByLayout: vi.fn(),
      getActiveSmartMenus: vi.fn(),
      getSmartMenusWithFeature: vi.fn(),
      getSmartMenusWithOrdering: vi.fn(),
      getByNRAClassification: vi.fn(),
      getByMenuType: vi.fn(),
      getByCuisineType: vi.fn(),
      getSmartMenusWithFooter: vi.fn(),
      getSmartMenusWithCustomFooterText: vi.fn(),
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    // Check that the dashboard title is rendered
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Overview of your SmartMenu performance and analytics.")
    ).toBeInTheDocument();

    // Check that metrics cards are rendered with correct values
    expect(screen.getByText("SmartMenus")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument(); // totalSmartMenus

    expect(screen.getByText("Active SmartMenus")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // activeSmartMenus

    expect(screen.getByText("Total Locations")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument(); // totalLocations

    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument(); // total orders (150 + 100)

    // Check that percentage changes are displayed (using getAllByText for multiple matches)
    expect(screen.getAllByText("+100.0%")).toHaveLength(1); // Only one +100.0% appears
    expect(screen.getByText("+8.3%")).toBeInTheDocument(); // Locations delta
    expect(screen.getAllByText("+50.0%")).toHaveLength(2); // Orders delta (appears in both metrics card and quarterly table)

    // Check that Player Analytics section is rendered
    expect(screen.getByTestId("player-analytics")).toBeInTheDocument();
  });

  it("displays loading state", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: true,
      error: null,
      metrics: {
        totalSmartMenus: 0,
        activeSmartMenus: 0,
        totalLocations: 0,
        featureAdoption: {
          withImages: 0,
          withOrderButton: 0,
          withByo: 0,
          byLayout: {},
        },
        settings: {
          withCustomColors: 0,
          withCustomFonts: 0,
          withDietaryPreferences: 0,
          withAllergens: 0,
        },
        classifications: {
          nraClassifications: {},
          menuTypes: {},
          cuisineTypes: {},
          orderingEnabled: 0,
          orderingDisabled: 0,
        },
      },
      getByLayout: vi.fn(),
      getActiveSmartMenus: vi.fn(),
      getSmartMenusWithFeature: vi.fn(),
      getSmartMenusWithOrdering: vi.fn(),
      getByNRAClassification: vi.fn(),
      getByMenuType: vi.fn(),
      getByCuisineType: vi.fn(),
      getSmartMenusWithFooter: vi.fn(),
      getSmartMenusWithCustomFooterText: vi.fn(),
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    // Check that loading states are shown
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    // When loading, the metrics show loading skeletons, not "0"
    expect(screen.getAllByRole("status")).toHaveLength(10); // Multiple loading skeletons
  });

  it("displays error state when service fails", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: false,
      error: "Failed to load dashboard metrics.",
      metrics: {
        totalSmartMenus: 0,
        activeSmartMenus: 0,
        totalLocations: 0,
        featureAdoption: {
          withImages: 0,
          withOrderButton: 0,
          withByo: 0,
          byLayout: {},
        },
        settings: {
          withCustomColors: 0,
          withCustomFonts: 0,
          withDietaryPreferences: 0,
          withAllergens: 0,
        },
        classifications: {
          nraClassifications: {},
          menuTypes: {},
          cuisineTypes: {},
          orderingEnabled: 0,
          orderingDisabled: 0,
        },
      },
      getByLayout: vi.fn(),
      getActiveSmartMenus: vi.fn(),
      getSmartMenusWithFeature: vi.fn(),
      getSmartMenusWithOrdering: vi.fn(),
      getByNRAClassification: vi.fn(),
      getByMenuType: vi.fn(),
      getByCuisineType: vi.fn(),
      getSmartMenusWithFooter: vi.fn(),
      getSmartMenusWithCustomFooterText: vi.fn(),
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    // Check that error message is displayed
    expect(
      screen.getByText("Failed to load dashboard metrics.")
    ).toBeInTheDocument();
  });

  it("handles zero previous period correctly", () => {
    const zeroPreviousMetrics = [
      {
        quarter: 4,
        year: 2024,
        quarterLabel: "Q4 2024",
        orders: {
          count: 100,
          qoqGrowth: 100,
          qoqGrowthPercent: 100.0,
        },
        activeSmartMenus: {
          count: 2,
          qoqGrowth: 2,
          qoqGrowthPercent: 100.0,
        },
        locations: {
          count: 10,
          qoqGrowth: 10,
          qoqGrowthPercent: 100.0,
        },
      },
      {
        quarter: 3,
        year: 2024,
        quarterLabel: "Q3 2024",
        orders: {
          count: 0,
          qoqGrowth: 0,
          qoqGrowthPercent: 0.0,
        },
        activeSmartMenus: {
          count: 0,
          qoqGrowth: 0,
          qoqGrowthPercent: 0.0,
        },
        locations: {
          count: 0,
          qoqGrowth: 0,
          qoqGrowthPercent: 0.0,
        },
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: mockSmartMenus,
      quarterlyMetrics: zeroPreviousMetrics,
      loading: false,
      error: null,
      metrics: mockMetrics,
      getByLayout: vi.fn(),
      getActiveSmartMenus: vi.fn(),
      getSmartMenusWithFeature: vi.fn(),
      getSmartMenusWithOrdering: vi.fn(),
      getByNRAClassification: vi.fn(),
      getByMenuType: vi.fn(),
      getByCuisineType: vi.fn(),
      getSmartMenusWithFooter: vi.fn(),
      getSmartMenusWithCustomFooterText: vi.fn(),
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    // When previous period is 0, should show +100% if current > 0
    // The +100% appears in both metrics cards and quarterly table
    expect(screen.getAllByText("+100%")).toHaveLength(1);
  });

  it("handles negative deltas correctly", () => {
    const negativeDeltaMetrics = [
      {
        quarter: 4,
        year: 2024,
        quarterLabel: "Q4 2024",
        orders: {
          count: 50,
          qoqGrowth: -50,
          qoqGrowthPercent: -50.0,
        },
        activeSmartMenus: {
          count: 1,
          qoqGrowth: -1,
          qoqGrowthPercent: -50.0,
        },
        locations: {
          count: 6,
          qoqGrowth: -6,
          qoqGrowthPercent: -50.0,
        },
      },
      {
        quarter: 3,
        year: 2024,
        quarterLabel: "Q3 2024",
        orders: {
          count: 100,
          qoqGrowth: 0,
          qoqGrowthPercent: 0.0,
        },
        activeSmartMenus: {
          count: 2,
          qoqGrowth: 0,
          qoqGrowthPercent: 0.0,
        },
        locations: {
          count: 12,
          qoqGrowth: 0,
          qoqGrowthPercent: 0.0,
        },
      },
    ];

    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: mockSmartMenus,
      quarterlyMetrics: negativeDeltaMetrics,
      loading: false,
      error: null,
      metrics: mockMetrics,
      getByLayout: vi.fn(),
      getActiveSmartMenus: vi.fn(),
      getSmartMenusWithFeature: vi.fn(),
      getSmartMenusWithOrdering: vi.fn(),
      getByNRAClassification: vi.fn(),
      getByMenuType: vi.fn(),
      getByCuisineType: vi.fn(),
      getSmartMenusWithFooter: vi.fn(),
      getSmartMenusWithCustomFooterText: vi.fn(),
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    // Current: 50, Previous: 100, Delta: -50%
    // The -50.0% appears in both metrics cards and quarterly table
    expect(screen.getAllByText("-50.0%")).toHaveLength(4);
  });
});
