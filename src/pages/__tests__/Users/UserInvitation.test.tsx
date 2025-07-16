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

describe("User Invitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
  });

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
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "✅ User created successfully",
        variant: "success",
      });
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

    expect(mockShowToast).toHaveBeenCalledWith({
      title: "❌ Email and password are required",
      variant: "error",
    });
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
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "❌ Failed to invite user: Email already exists",
        variant: "error",
      });
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
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "❌ Failed to invite user: Network error",
        variant: "error",
      });
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
      .mockImplementation(() => new Promise(() => {})); // Never resolves for invitation

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

    // Submit
    const inviteButtons = screen.getAllByText("Invite User");
    fireEvent.click(inviteButtons[1]);

    // Check loading state
    expect(screen.getByText("Inviting...")).toBeInTheDocument();
  });
});
