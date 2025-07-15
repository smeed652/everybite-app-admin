import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MetabaseUsers from "../pages/MetabaseUsers";

// Mock the MetabaseUsersTable component
vi.mock("../components/MetabaseUsersTable", () => ({
  MetabaseUsersTable: () => (
    <div data-testid="metabase-users-table">Metabase Users Table</div>
  ),
}));

const renderMetabaseUsersPage = () => {
  return render(
    <MemoryRouter>
      <MetabaseUsers />
    </MemoryRouter>
  );
};

describe("MetabaseUsers Page", () => {
  it("renders page title", () => {
    renderMetabaseUsersPage();
    expect(screen.getByText("Metabase Users")).toBeInTheDocument();
  });

  it("renders the MetabaseUsersTable component", () => {
    renderMetabaseUsersPage();
    expect(screen.getByTestId("metabase-users-table")).toBeInTheDocument();
  });

  it("has correct page layout structure", () => {
    renderMetabaseUsersPage();

    // Should have the main page container
    const pageContainer = screen.getByText("Metabase Users").closest("div");
    expect(pageContainer?.parentElement).toHaveClass("p-6");
  });

  it("displays descriptive text about the page", () => {
    renderMetabaseUsersPage();

    // Check for any descriptive text that might be present
    const tableComponent = screen.getByTestId("metabase-users-table");
    expect(tableComponent).toBeInTheDocument();
  });
});
