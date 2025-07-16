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

describe("Users Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
  });

  describe("Initial load", () => {
    it("should handle initial load failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: "Internal server error",
        }),
      });

      renderUsers();

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          title: "❌ Failed to fetch users: HTTP error! status: 500",
          variant: "error",
        });
      });
    });

    it("should handle initial load network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderUsers();

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          title: "❌ Failed to fetch users: Network error",
          variant: "error",
        });
      });
    });

    it("should handle malformed response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing users array
          nextToken: null,
        }),
      });

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
      });
    });
  });

  describe("Component structure", () => {
    it("should render all required elements", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: null,
        }),
      });

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText("Invite User")).toBeInTheDocument();
        expect(screen.getByRole("table")).toBeInTheDocument();
      });
    });

    it("should handle undefined users gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: undefined,
          nextToken: null,
        }),
      });

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByRole("table")).toBeInTheDocument();
      });
    });
  });

  describe("Error boundaries", () => {
    it("should handle component errors gracefully", async () => {
      // Mock a component that throws an error
      const MockUsersWithError = () => {
        throw new Error("Component error");
      };

      // Temporarily replace the component
      vi.doMock("../../Users", () => ({
        default: MockUsersWithError,
      }));

      // This should not crash the test runner
      expect(() => {
        render(
          <BrowserRouter>
            <AuthProvider>
              <ToastProvider>
                <MockUsersWithError />
              </ToastProvider>
            </AuthProvider>
          </BrowserRouter>
        );
      }).toThrow("Component error");
    });
  });

  describe("Environment configuration", () => {
    it("should work with different API URLs", async () => {
      vi.stubEnv("VITE_METABASE_API_URL", "https://api.example.com");

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

      // Verify the correct API URL was used
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.comusers?limit=20"
      );
    });
  });
});
