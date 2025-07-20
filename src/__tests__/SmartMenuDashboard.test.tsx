import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { DocumentNode } from "graphql";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "../pages/Dashboard";

// Mock the PlayerAnalyticsSection component
vi.mock("../features/dashboard/sections/PlayerAnalyticsSection", () => ({
  PlayerAnalyticsSection: () => (
    <div data-testid="player-analytics">Player Analytics</div>
  ),
}));

const GET_DASHBOARD_WIDGETS = gql`
  query GetDashboardWidgets {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        numberOfLocations
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled
      }
      pagination {
        total
      }
    }
  }
`;

const mockWidgets = [
  {
    id: "1",
    createdAt: "2024-11-01T10:00:00Z",
    publishedAt: "2024-11-02T10:00:00Z",
    numberOfLocations: 5,
    displayImages: true,
    layout: "CARD",
    isOrderButtonEnabled: true,
    isByoEnabled: false,
  },
  {
    id: "2",
    createdAt: "2024-11-15T10:00:00Z",
    publishedAt: null,
    numberOfLocations: 3,
    displayImages: false,
    layout: "TABLE",
    isOrderButtonEnabled: false,
    isByoEnabled: true,
  },
  {
    id: "3",
    createdAt: "2024-12-01T10:00:00Z",
    publishedAt: "2024-12-02T10:00:00Z",
    numberOfLocations: 8,
    displayImages: true,
    layout: "CARD",
    isOrderButtonEnabled: true,
    isByoEnabled: true,
  },
  {
    id: "4",
    createdAt: "2024-10-01T10:00:00Z",
    publishedAt: "2024-10-02T10:00:00Z",
    numberOfLocations: 12,
    displayImages: false,
    layout: "TABLE",
    isOrderButtonEnabled: false,
    isByoEnabled: false,
  },
];

const mocks = [
  {
    request: {
      query: GET_DASHBOARD_WIDGETS,
    },
    result: {
      data: {
        db_widgetsList: {
          items: mockWidgets,
          pagination: {
            total: mockWidgets.length,
          },
        },
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: GET_DASHBOARD_WIDGETS,
    },
    error: new Error("Failed to fetch widgets"),
  },
];

const renderDashboard = (
  testMocks: Array<{
    request: { query: DocumentNode };
    result?: {
      data: {
        db_widgetsList: {
          items: Array<{
            id: string;
            createdAt: string;
            publishedAt: string | null;
            numberOfLocations?: number;
            displayImages?: boolean;
            layout?: string;
            isOrderButtonEnabled?: boolean;
            isByoEnabled?: boolean;
          }>;
          pagination: {
            total: number;
          };
        };
      };
    };
    error?: Error;
  }> = mocks
) => {
  return render(
    <MockedProvider mocks={testMocks} addTypename={false}>
      <Dashboard />
    </MockedProvider>
  );
};

describe("Dashboard", () => {
  it("renders dashboard title", () => {
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders player analytics section", () => {
    renderDashboard();
    expect(screen.getByTestId("player-analytics")).toBeInTheDocument();
  });

  it("displays loading state for metrics cards", () => {
    renderDashboard();

    // Should show loading state initially
    const smartMenusCard = screen.getByText("SmartMenus");
    const activeSmartMenusCard = screen.getByText("Active SmartMenus");

    expect(smartMenusCard).toBeInTheDocument();
    expect(activeSmartMenusCard).toBeInTheDocument();
  });

  it("displays correct metrics when data loads", async () => {
    renderDashboard(mocks);

    // Wait for data to load
    await screen.findAllByTestId("metrics-card");

    const metricsCards = screen.getAllByTestId("metrics-card");
    expect(metricsCards).toHaveLength(4); // Now includes Total Orders card
  });

  it("calculates trending deltas correctly", async () => {
    // Create widgets with specific dates for trend calculation
    const now = new Date();
    const currentPeriod = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    const previousPeriod = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago

    const trendWidgets = [
      // Current 30-day period
      {
        id: "1",
        createdAt: currentPeriod.toISOString(),
        publishedAt: new Date(
          currentPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 5,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
      {
        id: "2",
        createdAt: new Date(
          currentPeriod.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        publishedAt: new Date(
          currentPeriod.getTime() + 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 8,
        displayImages: false,
        layout: "TABLE",
        isOrderButtonEnabled: false,
        isByoEnabled: true,
      },
      // Previous 30-day period
      {
        id: "3",
        createdAt: previousPeriod.toISOString(),
        publishedAt: new Date(
          previousPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 12,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: true,
      },
    ];

    const trendMocks = [
      {
        request: {
          query: GET_DASHBOARD_WIDGETS,
        },
        result: {
          data: {
            db_widgetsList: {
              items: trendWidgets,
              pagination: {
                total: trendWidgets.length,
              },
            },
          },
        },
      },
    ];

    renderDashboard(trendMocks);

    // Wait for data to load
    await screen.findAllByTestId("metrics-card");

    // Should show delta percentages
    // Current period: 2 created, 2 active, 13 locations (5+8)
    // Previous period: 1 created, 1 active, 12 locations
    // Delta: +100% for SmartMenus and Active SmartMenus, +8.3% for locations
    expect(screen.getAllByText("+100.0%")).toHaveLength(2);
    expect(screen.getByText("+8.3%")).toBeInTheDocument();
  });

  it("handles zero previous period correctly", async () => {
    const now = new Date();
    const currentPeriod = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

    const zeroPrevWidgets = [
      // Only current period widgets
      {
        id: "1",
        createdAt: currentPeriod.toISOString(),
        publishedAt: new Date(
          currentPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 5,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
    ];

    const zeroPrevMocks = [
      {
        request: {
          query: GET_DASHBOARD_WIDGETS,
        },
        result: {
          data: {
            db_widgetsList: {
              items: zeroPrevWidgets,
              pagination: {
                total: zeroPrevWidgets.length,
              },
            },
          },
        },
      },
    ];

    renderDashboard(zeroPrevMocks);

    await screen.findAllByTestId("metrics-card");

    // When previous period is 0, should show +100% if current > 0
    expect(screen.getAllByText("+100%")).toHaveLength(3);
  });

  it("handles empty widgets array", async () => {
    const emptyMocks = [
      {
        request: {
          query: GET_DASHBOARD_WIDGETS,
        },
        result: {
          data: {
            db_widgetsList: {
              items: [],
              pagination: {
                total: 0,
              },
            },
          },
        },
      },
    ];

    renderDashboard(emptyMocks);

    await screen.findAllByTestId("metrics-card");

    expect(screen.getAllByText("0%")).toHaveLength(4); // All four cards show 0%
  });

  it("displays error state when GraphQL query fails", async () => {
    renderDashboard(errorMocks);

    await screen.findByText("Failed to load dashboard metrics.");

    expect(
      screen.getByText("Failed to load dashboard metrics.")
    ).toBeInTheDocument();
  });

  it("handles widgets with null publishedAt", async () => {
    const now = new Date();
    const currentPeriod = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

    const unpublishedWidgets = [
      {
        id: "1",
        createdAt: currentPeriod.toISOString(),
        publishedAt: new Date(
          currentPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 5,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
      {
        id: "2",
        createdAt: new Date(
          currentPeriod.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        publishedAt: null, // Unpublished
        numberOfLocations: 3,
        displayImages: false,
        layout: "TABLE",
        isOrderButtonEnabled: false,
        isByoEnabled: true,
      },
    ];

    const unpublishedMocks = [
      {
        request: {
          query: GET_DASHBOARD_WIDGETS,
        },
        result: {
          data: {
            widgets: unpublishedWidgets,
          },
        },
      },
    ];

    renderDashboard(unpublishedMocks);

    await screen.findAllByTestId("metrics-card");
  });

  it("handles negative deltas correctly", async () => {
    const now = new Date();
    const currentPeriod = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    const previousPeriod = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago

    const negativeTrendWidgets = [
      // Current period: 1 created
      {
        id: "1",
        createdAt: currentPeriod.toISOString(),
        publishedAt: new Date(
          currentPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 5,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: false,
      },
      // Previous period: 2 created
      {
        id: "2",
        createdAt: previousPeriod.toISOString(),
        publishedAt: new Date(
          previousPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 8,
        displayImages: false,
        layout: "TABLE",
        isOrderButtonEnabled: false,
        isByoEnabled: true,
      },
      {
        id: "3",
        createdAt: new Date(
          previousPeriod.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        publishedAt: new Date(
          previousPeriod.getTime() + 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
        numberOfLocations: 12,
        displayImages: true,
        layout: "CARD",
        isOrderButtonEnabled: true,
        isByoEnabled: true,
      },
    ];

    const negativeMocks = [
      {
        request: {
          query: GET_DASHBOARD_WIDGETS,
        },
        result: {
          data: {
            db_widgetsList: {
              items: negativeTrendWidgets,
              pagination: {
                total: negativeTrendWidgets.length,
              },
            },
          },
        },
      },
    ];

    renderDashboard(negativeMocks);

    await screen.findAllByTestId("metrics-card");

    // Current: 1, Previous: 2, Delta: -50%
    expect(screen.getAllByText("-50.0%")).toHaveLength(2);
  });
});
