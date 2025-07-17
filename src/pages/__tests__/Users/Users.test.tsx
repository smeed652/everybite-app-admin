import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockFetch, renderUsers, setupTestEnvironment } from "./test-utils";

describe("Users Page", () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  describe("Initial loading state", () => {
    it("should show loading skeleton when fetching users", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderUsers();

      // During loading, skeleton elements should be visible
      expect(screen.getAllByRole("status")).toHaveLength(6); // 1 header + 5 table rows
    });
  });

  describe("Basic functionality", () => {
    it("should render the page title", async () => {
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
      });
    });

    it("should render invite form", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [],
          nextToken: null,
        }),
      });

      renderUsers();

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Email address")
        ).toBeInTheDocument();
        expect(screen.getByText("Invite User")).toBeInTheDocument();
      });
    });
  });
});
