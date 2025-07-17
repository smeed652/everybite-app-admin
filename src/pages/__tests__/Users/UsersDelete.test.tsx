import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockFetch,
  mockShowToast,
  mockUsers,
  renderUsers,
  setupTestEnvironment,
} from "./test-utils";

describe("Users Delete", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should delete user successfully", async () => {
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
          message: "User deleted successfully",
        }),
      });

    // Mock confirm
    global.confirm = vi.fn(() => true);

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Open menu
    const ellipsisButton = screen.getByLabelText(
      "Actions for user1@example.com"
    );
    await userEvent.click(ellipsisButton);

    // Click delete
    const deleteButton = screen.getByText("Delete");
    await userEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete user user1?"
    );

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "User deleted successfully",
        variant: "success",
      });
    });
  });
});
