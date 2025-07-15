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

const GET_ALL_WIDGETS = gql`
  query GetAllWidgets {
    widgets {
      id
      createdAt
      publishedAt
    }
  }
`;

const mockWidgets = [
  {
    id: "1",
    createdAt: "2024-11-01T10:00:00Z",
    publishedAt: "2024-11-02T10:00:00Z",
  },
  {
    id: "2",
    createdAt: "2024-11-15T10:00:00Z",
    publishedAt: null,
  },
  {
    id: "3",
    createdAt: "2024-12-01T10:00:00Z",
    publishedAt: "2024-12-02T10:00:00Z",
  },
  {
    id: "4",
    createdAt: "2024-10-01T10:00:00Z",
    publishedAt: "2024-10-02T10:00:00Z",
  },
];

const mocks = [
  {
    request: {
      query: GET_ALL_WIDGETS,
    },
    result: {
      data: {
        widgets: mockWidgets,
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: GET_ALL_WIDGETS,
    },
    error: new Error("Failed to fetch widgets"),
  },
];

const renderDashboard = (
  mocks: Array<{
    request: { query: DocumentNode };
    result?: {
      data: {
        widgets: Array<{
          id: string;
          createdAt: string;
          publishedAt: string | null;
        }>;
      };
    };
    error?: Error;
  }> = []
) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
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
    expect(metricsCards).toHaveLength(2);
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
      },
      {
        id: "2",
        createdAt: new Date(
          currentPeriod.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        publishedAt: new Date(
          currentPeriod.getTime() + 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // Previous 30-day period
      {
        id: "3",
        createdAt: previousPeriod.toISOString(),
        publishedAt: new Date(
          previousPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    const trendMocks = [
      {
        request: {
          query: GET_ALL_WIDGETS,
        },
        result: {
          data: {
            widgets: trendWidgets,
          },
        },
      },
    ];

    renderDashboard(trendMocks);

    // Wait for data to load
    await screen.findAllByTestId("metrics-card");

    // Should show delta percentages
    // Current period: 2 created, 2 active
    // Previous period: 1 created, 1 active
    // Delta: +100% for both
    expect(screen.getAllByText("+100.0%")).toHaveLength(2);
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
      },
    ];

    const zeroPrevMocks = [
      {
        request: {
          query: GET_ALL_WIDGETS,
        },
        result: {
          data: {
            widgets: zeroPrevWidgets,
          },
        },
      },
    ];

    renderDashboard(zeroPrevMocks);

    await screen.findAllByTestId("metrics-card");

    // When previous period is 0, should show +100% if current > 0
    expect(screen.getAllByText("+100%")).toHaveLength(2);
  });

  it("handles empty widgets array", async () => {
    const emptyMocks = [
      {
        request: {
          query: GET_ALL_WIDGETS,
        },
        result: {
          data: {
            widgets: [],
          },
        },
      },
    ];

    renderDashboard(emptyMocks);

    await screen.findAllByTestId("metrics-card");

    expect(screen.getAllByText("0%")).toHaveLength(2); // Both cards show 0%
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
      },
      {
        id: "2",
        createdAt: new Date(
          currentPeriod.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        publishedAt: null, // Unpublished
      },
    ];

    const unpublishedMocks = [
      {
        request: {
          query: GET_ALL_WIDGETS,
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
      },
      // Previous period: 2 created
      {
        id: "2",
        createdAt: previousPeriod.toISOString(),
        publishedAt: new Date(
          previousPeriod.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "3",
        createdAt: new Date(
          previousPeriod.getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        publishedAt: new Date(
          previousPeriod.getTime() + 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    const negativeMocks = [
      {
        request: {
          query: GET_ALL_WIDGETS,
        },
        result: {
          data: {
            widgets: negativeTrendWidgets,
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
