import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../../components/ui/ToastProvider";
import { AuthProvider } from "../../../context/AuthContext";
import Users from "../../Users";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useToast
const mockShowToast = vi.fn();
vi.mock("../../../components/ui/ToastProvider", async () => {
  const actual = await vi.importActual("../../../components/ui/ToastProvider");
  return {
    ...actual,
    useToast: vi.fn(() => ({
      showToast: mockShowToast,
    })),
  };
});

// Mock AuthContext
const mockAuthContext = {
  accessToken: "mock-token" as string | null,
  user: { username: "testuser", groups: ["ADMIN"] },
  signIn: vi.fn(),
  signOut: vi.fn(),
  loading: false,
};

vi.mock("../../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../../context/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(() => mockAuthContext),
  };
});

const mockUsers = [
  {
    username: "user1",
    email: "user1@example.com",
    emailVerified: true,
    status: "CONFIRMED",
    enabled: true,
    createdAt: "2024-12-31T00:00:00.000Z",
    lastModified: "2024-12-31T00:00:00.000Z",
  },
  {
    username: "user2",
    email: "user2@example.com",
    emailVerified: false,
    status: "UNCONFIRMED",
    enabled: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    lastModified: "2025-01-01T00:00:00.000Z",
  },
];

const renderUsers = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Users />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Users List Display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
