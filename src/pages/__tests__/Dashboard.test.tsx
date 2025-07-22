import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useSmartMenuSettings } from "../../hooks/useSmartMenuSettings";
import Dashboard from "../Dashboard";

// Mock the underlying SmartMenu settings hook
vi.mock("../../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

describe("Dashboard page", () => {
  const mockUseSmartMenuSettings = vi.mocked(useSmartMenuSettings);

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock return value
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [
        {
          id: "1",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 10
          ).toISOString(),
          publishedAt: null,
          numberOfLocations: 5,
        },
        {
          id: "2",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 40
          ).toISOString(),
          publishedAt: new Date().toISOString(),
          numberOfLocations: 5,
        },
      ],
      quarterlyMetrics: [
        {
          quarterLabel: "Q4 2024",
          activeSmartMenus: { count: 1, qoqGrowthPercent: 0 },
          locations: { count: 8, qoqGrowthPercent: 0 },
          orders: { count: 150, qoqGrowthPercent: 20 },
        },
        {
          quarterLabel: "Q3 2024",
          activeSmartMenus: { count: 1, qoqGrowthPercent: 0 },
          locations: { count: 8, qoqGrowthPercent: 0 },
          orders: { count: 125, qoqGrowthPercent: 0 },
        },
      ],
      loading: false,
      error: null,
      metrics: {
        totalSmartMenus: 2,
        activeSmartMenus: 1,
        totalLocations: 8,
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
  });

  it("renders metrics cards with correct counts", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/^SmartMenus$/i).nextSibling?.textContent).toBe(
      "2"
    );
    expect(
      screen.getByText(/^Active SmartMenus$/i).nextSibling?.textContent
    ).toBe("1");
    expect(
      screen.getByText(/^Total Locations$/i).nextSibling?.textContent
    ).toBe("10");
  });

  // This test would have caught the data structure mismatch issue
  it("handles quarterly metrics with missing brands field gracefully", () => {
    // Mock the hook with data that matches the actual Lambda response structure
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [
        {
          id: "1",
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          numberOfLocations: 5,
        },
      ],
      quarterlyMetrics: [
        {
          quarter: "2025-07-01T00:00:00Z",
          year: 2025,
          quarterLabel: "Q3 2025",
          brands: {
            count: 0,
            qoqGrowth: -5,
            qoqGrowthPercent: -100,
          },
          locations: {
            count: 0,
            qoqGrowth: -415,
            qoqGrowthPercent: -100,
          },
          orders: {
            count: 12150,
            qoqGrowth: -33779,
            qoqGrowthPercent: -73.54,
          },
          activeSmartMenus: {
            count: 0,
            qoqGrowth: -5,
            qoqGrowthPercent: -100,
          },
          totalRevenue: {
            amount: 0,
            qoqGrowth: 0,
            qoqGrowthPercent: 0,
          },
        },
      ],
      loading: false,
      error: null,
      metrics: {
        totalSmartMenus: 1,
        activeSmartMenus: 1,
        totalLocations: 5,
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Should render without crashing
    expect(screen.getByText(/^Dashboard$/i)).toBeInTheDocument();

    // Should display quarterly data
    expect(screen.getByText("Q3 2025")).toBeInTheDocument();
  });

  // This test would have caught the case where quarterly metrics are empty
  it("displays 'No quarterly data available' when quarterly metrics are empty", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [], // Empty quarterly metrics
      loading: false,
      error: null,
      metrics: {
        totalSmartMenus: 0,
        activeSmartMenus: 0,
        totalLocations: 0,
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("No quarterly data available")).toBeInTheDocument();
  });

  // This test would have caught the case where quarterly metrics have partial data
  it("handles quarterly metrics with partial data structure", () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [
        {
          quarterLabel: "Q3 2025",
          // Missing brands field - this is what was causing the crash
          locations: { count: 5, qoqGrowthPercent: 10 },
          orders: { count: 100, qoqGrowthPercent: 20 },
          activeSmartMenus: { count: 2, qoqGrowthPercent: 5 },
        },
      ],
      loading: false,
      error: null,
      metrics: {
        totalSmartMenus: 0,
        activeSmartMenus: 0,
        totalLocations: 0,
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Should render without crashing and use fallback values
    expect(screen.getByText(/^Dashboard$/i)).toBeInTheDocument();
    expect(screen.getByText("Q3 2025")).toBeInTheDocument();
  });
});
