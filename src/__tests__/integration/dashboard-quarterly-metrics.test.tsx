import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "../../pages/Dashboard";

// Mock the entire hook module
vi.mock("../../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: vi.fn(),
}));

describe("Dashboard Quarterly Metrics Integration", () => {
  const mockUseSmartMenuSettings = vi.mocked(
    require("../../hooks/useSmartMenuSettings").useSmartMenuSettings
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display quarterly metrics when data is available", async () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [
        {
          quarter: "2025-07-01T00:00:00Z",
          year: 2025,
          quarterLabel: "Q3 2025",
          brands: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
          totalRevenue: {
            amount: 50000,
            qoqGrowth: 10000,
            qoqGrowthPercent: 25,
          },
        },
        {
          quarter: "2025-04-01T00:00:00Z",
          year: 2025,
          quarterLabel: "Q2 2025",
          brands: { count: 3, qoqGrowth: 1, qoqGrowthPercent: 50 },
          locations: { count: 80, qoqGrowth: 15, qoqGrowthPercent: 23 },
          orders: { count: 800, qoqGrowth: 150, qoqGrowthPercent: 23 },
          activeSmartMenus: { count: 3, qoqGrowth: 1, qoqGrowthPercent: 50 },
          totalRevenue: {
            amount: 40000,
            qoqGrowth: 8000,
            qoqGrowthPercent: 25,
          },
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

    // Should display quarterly data
    await waitFor(() => {
      expect(screen.getByText("Q3 2025")).toBeInTheDocument();
      expect(screen.getByText("Q2 2025")).toBeInTheDocument();
    });

    // Should not show "No quarterly data available"
    expect(
      screen.queryByText("No quarterly data available")
    ).not.toBeInTheDocument();
  });

  it("should display 'No quarterly data available' when quarterly metrics are empty", async () => {
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

    await waitFor(() => {
      expect(
        screen.getByText("No quarterly data available")
      ).toBeInTheDocument();
    });
  });

  it("should handle missing brands field gracefully", async () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [
        {
          quarter: "2025-07-01T00:00:00Z",
          year: 2025,
          quarterLabel: "Q3 2025",
          // Missing brands field - this was causing the crash
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
          totalRevenue: {
            amount: 50000,
            qoqGrowth: 10000,
            qoqGrowthPercent: 25,
          },
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

    // Should render without crashing
    await waitFor(() => {
      expect(screen.getByText(/^Dashboard$/i)).toBeInTheDocument();
      expect(screen.getByText("Q3 2025")).toBeInTheDocument();
    });
  });

  it("should handle loading state correctly", async () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: true, // Loading state
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

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/^Dashboard$/i)).toBeInTheDocument();
    });

    // Should not show "No quarterly data available" during loading
    expect(
      screen.queryByText("No quarterly data available")
    ).not.toBeInTheDocument();
  });

  it("should handle error state correctly", async () => {
    mockUseSmartMenuSettings.mockReturnValue({
      smartMenus: [],
      quarterlyMetrics: [],
      loading: false,
      error: "Failed to load quarterly metrics", // Error state
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

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load quarterly metrics")
      ).toBeInTheDocument();
    });
  });
});
