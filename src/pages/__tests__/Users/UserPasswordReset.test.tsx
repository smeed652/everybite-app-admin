import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../context/AuthContext";
import Users from "../../Users";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock confirm
global.confirm = vi.fn(() => true);

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

describe("User Password Reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
    mockFetch.mockReset();
    (mockToast.error as ReturnType<typeof vi.fn>).mockReset();
    (mockToast.success as ReturnType<typeof vi.fn>).mockReset();
    (global.confirm as ReturnType<typeof vi.fn>).mockReset();
    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it("should reset password successfully", async () => {
    const user = userEvent.setup();
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

    // Open action menu for user1
    const actionButton = screen.getByLabelText("Actions for user1@example.com");
    await user.click(actionButton);

    // Click reset password
    await user.click(await screen.findByText("Reset Password"));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "User reset-passwordd successfully"
      );
    });
  });
});
