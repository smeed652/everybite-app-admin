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

describe("Users Enable/Disable", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should enable user successfully", async () => {
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
        ok: true,
        json: async () => ({
          message: "User enabled successfully",
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    // Open menu for disabled user
    const ellipsisButton = screen.getByLabelText(
      "Actions for user2@example.com"
    );
    await userEvent.click(ellipsisButton);

    // Click enable
    const enableButton = screen.getByText("Enable");
    await userEvent.click(enableButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "User enabled successfully",
        variant: "success",
      });
    });
  });

  it("should disable user successfully", async () => {
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
        ok: true,
        json: async () => ({
          message: "User disabled successfully",
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

    // Click disable
    const disableButton = screen.getByText("Disable");
    await userEvent.click(disableButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "User disabled successfully",
        variant: "success",
      });
    });
  });
});
