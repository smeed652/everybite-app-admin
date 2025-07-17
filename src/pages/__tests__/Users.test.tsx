import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../context/AuthContext";
import Users from "../Users";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock react-hot-toast
const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
};
vi.mock("react-hot-toast", () => mockToast);

// Mock AuthContext
const mockAuthContext = {
  accessToken: "mock-token" as string | null,
  user: { username: "testuser", groups: ["ADMIN"] },
  signIn: vi.fn(),
  signOut: vi.fn(),
  loading: false,
};

vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(() => mockAuthContext),
  };
});

const mockUsers = [
  {
    username: "user1",
    email: "user1@example.com",
    status: "CONFIRMED",
    enabled: true,
    created: "2024-12-31T00:00:00.000Z",
  },
  {
    username: "user2",
    email: "user2@example.com",
    status: "UNCONFIRMED",
    enabled: false,
    created: "2025-01-01T00:00:00.000Z",
  },
];

const renderUsers = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Users />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Users page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default environment variable
    vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
  });

  describe("Initial loading state", () => {
    it("should show loading skeleton when fetching users", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderUsers();

      // During loading, skeleton elements should be visible
      expect(screen.getAllByRole("status")).toHaveLength(6); // 1 header + 5 table rows
    });
  });

  describe("User list display", () => {
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
      expect(screen.getByText("UNCONFIRMED (Disabled)")).toBeInTheDocument();
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
        const unconfirmedStatus = screen.getByText("UNCONFIRMED (Disabled)");

        expect(confirmedStatus).toHaveClass("text-green-600");
        expect(unconfirmedStatus).toHaveClass("text-red-600");
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
        // The dates should be formatted and visible, but exact format may vary by locale
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

  describe("User invitation", () => {
    it("should invite user successfully", async () => {
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
            message: "User created successfully",
            user: {
              username: "newuser",
              email: "newuser@example.com",
              status: "UNCONFIRMED",
            },
          }),
        });

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      });

      // Open invite form - click the header button that toggles the form
      const inviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(inviteButtons[0]); // First button is the header button

      // Fill form
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "newuser@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });

      // Submit - get the second "Invite User" button (the one in the form)
      const formInviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(formInviteButtons[1]);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "User invited successfully"
        );
      });
    });

    it("should not invite with empty email", async () => {
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

      // Open invite form - click the header button that toggles the form
      const inviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(inviteButtons[0]); // First button is the header button

      // Try to submit without email
      const formInviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(formInviteButtons[1]);

      expect(mockToast.error).toHaveBeenCalledWith(
        "Email and password are required"
      );
    });

    it("should handle invitation failure", async () => {
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
            message: "Email already exists",
          }),
        });

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      });

      // Open invite form - click the header button that toggles the form
      const inviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(inviteButtons[0]); // First button is the header button

      // Fill form
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });

      // Submit - get the second "Invite User" button (the one in the form)
      const formInviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(formInviteButtons[1]);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Email already exists");
      });
    });

    it("should handle invitation network error", async () => {
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

      // Open invite form
      fireEvent.click(screen.getByText("Invite User"));

      // Fill form
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "newuser@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });

      // Submit - get the second "Invite User" button (the one in the form)
      const inviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(inviteButtons[1]);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to invite user");
      });
    });

    it("should show loading state during invitation", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            users: mockUsers,
            nextToken: null,
          }),
        })
        .mockImplementation(() => new Promise(() => {})); // Never resolves for invite

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      });

      // Open invite form
      fireEvent.click(screen.getByText("Invite User"));

      // Fill form
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "newuser@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });

      // Submit - get the second "Invite User" button (the one in the form)
      const inviteButtons = screen.getAllByText("Invite User");
      fireEvent.click(inviteButtons[1]);

      // Should show loading state
      expect(screen.getByText("Inviting...")).toBeInTheDocument();
    });
  });

  describe("User actions", () => {
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
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);
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
        expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      });

      // Open menu for enabled user
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);
      await waitFor(() => {
        expect(screen.getByText("Disable")).toBeInTheDocument();
      });

      // Should show "Disable" for enabled user
      expect(screen.getByText("Disable")).toBeInTheDocument();
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

      // Open menu for disabled user - find the ellipsis button in user2's row
      const user2Row = screen.getByText("user2@example.com").closest("tr");
      const ellipsisButton = user2Row?.querySelector(
        'button[aria-haspopup="menu"]'
      );
      await userEvent.click(ellipsisButton!);

      // Click enable
      const enableButtons = await screen.findAllByText(
        (content) => content.includes("Enable"),
        {},
        { timeout: 2000 }
      );
      const menuEnableButton = enableButtons.find(
        (el) => el.getAttribute && el.getAttribute("role") === "menuitem"
      );
      await userEvent.click(menuEnableButton!);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "User enabled successfully"
        );
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
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);

      // Click disable
      const disableButtons = await screen.findAllByText(
        (content) => content.includes("Disable"),
        {},
        { timeout: 2000 }
      );
      const menuDisableButton = disableButtons.find(
        (el) => el.getAttribute && el.getAttribute("role") === "menuitem"
      );
      await userEvent.click(menuDisableButton!);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "User disabled successfully"
        );
      });
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
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);

      // Click reset password
      const resetButtons = await screen.findAllByText(
        (content) => content.includes("Reset Password"),
        {},
        { timeout: 2000 }
      );
      const menuResetButton = resetButtons.find(
        (el) => el.getAttribute && el.getAttribute("role") === "menuitem"
      );
      await userEvent.click(menuResetButton!);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "User reset-passwordd successfully"
        );
      });
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
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);

      // Click delete
      const deleteButtons = await screen.findAllByText(
        (content) => content.includes("Delete"),
        {},
        { timeout: 2000 }
      );
      const menuDeleteButton = deleteButtons.find(
        (el) => el.getAttribute && el.getAttribute("role") === "menuitem"
      );
      await userEvent.click(menuDeleteButton!);

      expect(global.confirm).toHaveBeenCalledWith(
        "Are you sure you want to delete user user1?"
      );

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "User deleted successfully"
        );
      });
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
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);

      // Wait for menu to open and then click disable
      const disableButtons2 = await screen.findAllByText(
        (content) => content.includes("Disable"),
        {},
        { timeout: 2000 }
      );
      const menuDisableButton2 = disableButtons2.find(
        (el) => el.getAttribute && el.getAttribute("role") === "menuitem"
      );
      await userEvent.click(menuDisableButton2!);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to disable user");
      });
    });

    it("should handle action network error", async () => {
      // Reset mocks to ensure isolation
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

      // Open menu with userEvent
      const actionButtons = screen.getAllByRole("button");
      const ellipsisButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-ellipsis")
      );
      await userEvent.click(ellipsisButton!);

      // Wait for menu to open and then click disable (find all and filter by role)
      const disableButtons = await screen.findAllByText(
        (content) => content.includes("Disable"),
        {},
        { timeout: 2000 }
      );
      const menuDisableButton = disableButtons.find(
        (el) => el.getAttribute && el.getAttribute("role") === "menuitem"
      );
      await userEvent.click(menuDisableButton!);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to disable user");
      });
    });
  });

  describe("Pagination", () => {
    it("should handle pagination with nextToken", async () => {
      // Reset mocks to ensure isolation
      mockFetch.mockReset();
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
});
