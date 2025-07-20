import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "../Dashboard";

// Mock the underlying SmartMenu settings hook
vi.mock("../../hooks/useSmartMenuSettings", () => ({
  useSmartMenuSettings: () => ({
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
        numberOfLocations: 8,
      },
    ],
    loading: false,
    error: null,
    metrics: {
      totalSmartMenus: 2,
      activeSmartMenus: 1,
      totalLocations: 8,
    },
  }),
}));

// Mock the quarterly metrics Lambda hook
vi.mock("../features/dashboard/hooks/lambda", () => ({
  useQuarterlyMetricsLambda: () => ({
    quarterlyData: [],
    totalOrders: 150,
    ordersDelta: "+20%",
    loading: false,
    error: null,
  }),
}));

describe("Dashboard page", () => {
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
    ).toBe("8");
  });
});
