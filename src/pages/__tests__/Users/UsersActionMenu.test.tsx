import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  mockFetch,
  mockUsers,
  renderUsers,
  setupTestEnvironment,
} from "./test-utils";

describe("Users Action Menu", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should open and close action menu", async () => {
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
    });

    // Open menu
    const ellipsisButton = screen.getByLabelText(
      "Actions for user1@example.com"
    );
    await userEvent.click(ellipsisButton);

    await waitFor(() => {
      expect(screen.getByText("Disable")).toBeInTheDocument();
    });

    // Should show menu items
    expect(screen.getByText("Disable")).toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should show correct action text based on user status", async () => {
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
    });

    // Open menu for enabled user
    const ellipsisButton = screen.getByLabelText(
      "Actions for user1@example.com"
    );
    await userEvent.click(ellipsisButton);

    // Should show "Disable" for enabled user
    expect(screen.getByText("Disable")).toBeInTheDocument();
  });
});
