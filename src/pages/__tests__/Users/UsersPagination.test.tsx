import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  mockFetch,
  mockUsers,
  renderUsers,
  setupTestEnvironment,
} from "./test-utils";

describe("Users Pagination", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it("should handle pagination with nextToken", async () => {
    const firstPageUsers = mockUsers.slice(0, 1);
    const secondPageUsers = mockUsers.slice(1);

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: firstPageUsers,
          nextToken: "token123",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: secondPageUsers,
          nextToken: null,
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });

    // Click load more
    fireEvent.click(screen.getByText("Load More"));

    await waitFor(() => {
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    // Load more button should be hidden after loading all data
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });
});
