import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  mockFetch,
  mockShowToast,
  mockUsers,
  renderUsers,
  setupTestEnvironment,
} from "./test-utils";

describe("Users Action Errors", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should handle action failure", async () => {
    mockFetch.mockReset();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: "Cannot disable admin user",
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

    // Click disable
    const disableButton = screen.getByText("Disable");
    await userEvent.click(disableButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Failed to disable user",
        variant: "error",
      });
    });
  });

  it("should handle action network error", async () => {
    mockFetch.mockReset();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      })
      .mockRejectedValueOnce(new Error("Network error"));

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Open menu
    const ellipsisButton = screen.getByLabelText(
      "Actions for user1@example.com"
    );
    await userEvent.click(ellipsisButton);

    // Click disable
    const disableButton = screen.getByText("Disable");
    await userEvent.click(disableButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Network error",
        variant: "error",
      });
    });
  });
});
