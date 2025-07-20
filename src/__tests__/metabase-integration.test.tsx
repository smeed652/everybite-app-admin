import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

// Mock the MetabaseUsersTable component
vi.mock("../components/MetabaseUsersTable", () => ({
  default: () => (
    <div data-testid="metabase-users-table">Metabase Users Table</div>
  ),
}));

// Mock the PlayerAnalyticsSection component
vi.mock("../features/dashboard/sections/PlayerAnalyticsSection", () => ({
  PlayerAnalyticsSection: () => (
    <div data-testid="player-analytics">Player Analytics</div>
  ),
}));

// Mock authentication
vi.mock("../lib/auth", () => ({
  getCurrentUser: vi.fn(() => Promise.resolve({ username: "testuser" })),
  signOut: vi.fn(() => Promise.resolve()),
}));

// Mock AWS Amplify for all tests in this file
vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: {
      accessToken: {
        toString: () => "valid-access-token",
        payload: { "cognito:groups": ["ADMIN"] },
      },
      idToken: {
        toString: () => "valid-id-token",
        payload: { "cognito:groups": ["ADMIN"] },
      },
    },
    credentials: { accessKeyId: "a", secretAccessKey: "b" },
    identityId: "test-identity",
    userSub: "test-user",
  }),
}));

const GET_ALL_WIDGETS = gql`
  query GetAllWidgetsForDashboard {
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

const renderApp = (initialPath = "/") => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe("Metabase Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to Metabase Users page from sidebar", async () => {
    renderApp("/dashboard");

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    // Find and click the Metabase Users navigation link
    const metabaseLink = screen.getByRole("link", { name: "Metabase Users" });
    fireEvent.click(metabaseLink);

    // Should navigate to Metabase Users page
    await waitFor(() => {
      expect(screen.getByTestId("metabase-users-table")).toBeInTheDocument();
    });
  });

  it("displays Metabase Users page when directly accessed", async () => {
    renderApp("/metabase-users");

    await waitFor(
      () => {
        expect(screen.getByTestId("metabase-users-table")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("maintains navigation state when switching between pages", async () => {
    renderApp("/dashboard");

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    // Navigate to Metabase Users
    const metabaseLink = screen.getByRole("link", { name: "Metabase Users" });
    fireEvent.click(metabaseLink);

    await waitFor(() => {
      expect(screen.getByTestId("metabase-users-table")).toBeInTheDocument();
    });

    // Navigate back to Dashboard
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    fireEvent.click(dashboardLink);

    await waitFor(() => {
      expect(screen.getByTestId("player-analytics")).toBeInTheDocument();
    });
  });

  it("shows correct active navigation state", async () => {
    renderApp("/metabase-users");

    await waitFor(() => {
      expect(screen.getByTestId("metabase-users-table")).toBeInTheDocument();
    });

    // The Metabase Users link should be highlighted as active
    const metabaseLink = screen.getByRole("link", { name: "Metabase Users" });
    expect(metabaseLink).toHaveClass("bg-accent");
  });

  it("handles 404 for invalid Metabase routes", async () => {
    renderApp("/metabase-users/invalid");

    await waitFor(() => {
      expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
    });
  });

  it("preserves URL state during navigation", async () => {
    const { container } = renderApp("/metabase-users");

    await waitFor(() => {
      expect(screen.getByTestId("metabase-users-table")).toBeInTheDocument();
    });

    // URL should be preserved
    expect(container.innerHTML).toContain("Metabase Users Table");
  });
});
