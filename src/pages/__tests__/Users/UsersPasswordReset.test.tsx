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

describe("Users Password Reset", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should reset password successfully", async () => {
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
          message: "Password reset successfully",
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

    // Click reset password
    const resetButton = screen.getByText("Reset Password");
    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "User reset-passwordd successfully",
        variant: "success",
      });
    });
  });
});
