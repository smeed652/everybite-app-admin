/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SmartMenus from "../SmartMenus";

// Mock useSmartMenus hook to avoid real network
vi.mock("../../features/smartMenus/hooks/useSmartMenus", () => ({
  useSmartMenus: () => ({
    smartMenus: [
      {
        id: "1",
        name: "ACME",
        slug: "acme",
        displayImages: true,
        isSyncEnabled: false,
        orderUrl: "https://example.com?utm_source=test",
        layout: "card",
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        primaryBrandColor: "#ff0000",
        highlightColor: "#00ff00",
        backgroundColor: "#0000ff",
      },
    ],
    loading: false,
    error: null,
  }),
}));

describe("SmartMenus page", () => {
  it("renders table and navigates on row click", () => {
    const navigateSpy = vi.fn();
    render(
      <MemoryRouter initialEntries={["/smartmenus"]}>
        <Routes>
          <Route path="/smartmenus" element={<SmartMenus />} />
          <Route
            path="/smartmenus/:id"
            element={<div data-testid="details">Details</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Row should render menu name
    expect(screen.getByText("ACME")).toBeInTheDocument();

    // Click the row
    const row = screen.getByText("ACME").closest("tr") as HTMLElement;
    fireEvent.click(row);

    // Expect navigation to detail route
    expect(screen.getByTestId("details")).toBeInTheDocument();
  });
});
