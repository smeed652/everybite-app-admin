import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("User Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
  });

  it("should load next page successfully", async () => {
    const nextPageUsers = [
      {
        username: "user3",
        email: "user3@example.com",
        emailVerified: true,
        status: "CONFIRMED",
        enabled: true,
        createdAt: "2025-01-02T00:00:00.000Z",
        lastModified: "2025-01-02T00:00:00.000Z",
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: "next-page-token",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: nextPageUsers,
          nextToken: null,
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Click next page button
    fireEvent.click(screen.getByText("Load More"));

    await waitFor(() => {
      expect(screen.getByText("user3@example.com")).toBeInTheDocument();
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });
  });

  it("should load more users successfully", async () => {
    const nextPageUsers = [
      {
        username: "user3",
        email: "user3@example.com",
        emailVerified: true,
        status: "CONFIRMED",
        enabled: true,
        createdAt: "2025-01-02T00:00:00.000Z",
        lastModified: "2025-01-02T00:00:00.000Z",
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: "next-page-token",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: nextPageUsers,
          nextToken: null,
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Load more users
    fireEvent.click(screen.getByText("Load More"));

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user3@example.com")).toBeInTheDocument();
    });
  });

  it("should handle pagination failure", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: "next-page-token",
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: "Internal server error",
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Click next page button
    fireEvent.click(screen.getByText("Load More"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "❌ Failed to fetch users: HTTP error! status: 500",
        variant: "error",
      });
    });
  });

  it("should handle pagination network error", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: "next-page-token",
        }),
      })
      .mockRejectedValueOnce(new Error("Network error"));

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Click next page button
    fireEvent.click(screen.getByText("Load More"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "❌ Failed to fetch users: Network error",
        variant: "error",
      });
    });
  });

  it("should show correct pagination state", async () => {
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

    // When no next token, Load More button should not be shown
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  it("should show loading state during pagination", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          nextToken: "next-page-token",
        }),
      })
      .mockImplementation(() => new Promise(() => {})); // Never resolves for next page

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Click load more button
    fireEvent.click(screen.getByText("Load More"));

    // Check loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
