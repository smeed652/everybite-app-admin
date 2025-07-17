import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  mockFetch,
  mockUsers,
  renderUsers,
  setupTestEnvironment,
} from "./test-utils";

describe("Users List Display", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should display users successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: mockUsers,
        nextToken: null,
      }),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("UNCONFIRMED")).toBeInTheDocument();
  });

  it("should display correct status badges", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: mockUsers,
        nextToken: null,
      }),
    });

    renderUsers();

    await waitFor(() => {
      const confirmedStatus = screen.getByText("CONFIRMED");
      const unconfirmedStatus = screen.getByText("UNCONFIRMED");

      expect(confirmedStatus).toHaveClass("bg-green-100", "text-green-800");
      expect(unconfirmedStatus).toHaveClass("bg-yellow-100", "text-yellow-800");
    });
  });

  it("should display created dates correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: mockUsers,
        nextToken: null,
      }),
    });

    renderUsers();

    await waitFor(() => {
      // Check that dates are displayed (without relying on specific format)
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      // Check that we have the expected number of date cells (2 users = 2 dates)
      const dateCells = screen.getAllByText(/\d{1,2}[/-]\d{1,2}[/-]\d{4}/);
      expect(dateCells.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should handle empty user list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [],
        nextToken: null,
      }),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.queryByText("user1@example.com")).not.toBeInTheDocument();
    });
  });
});
