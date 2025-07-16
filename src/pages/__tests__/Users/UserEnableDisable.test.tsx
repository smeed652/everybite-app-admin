import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../../components/ui/ToastProvider";
import { AuthProvider } from "../../../context/AuthContext";
import Users from "../../Users";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock confirm
global.confirm = vi.fn(() => true);

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

describe("User Enable/Disable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
    mockFetch.mockReset();
    mockShowToast.mockReset();
    (global.confirm as ReturnType<typeof vi.fn>).mockReset();
    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it("should enable user successfully", async () => {
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
          message: "User enabled successfully",
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    // Open action menu for disabled user
    const actionButtons = screen.getAllByRole("button");
    const moreButtons = actionButtons.filter(
      (button) =>
        button.querySelector("svg")?.getAttribute("aria-hidden") === "true" &&
        button.querySelector("svg")?.classList.contains("lucide-ellipsis")
    );

    await user.click(moreButtons[1]); // Second user (disabled)

    // Click enable
    await user.click(await screen.findByText("Enable"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "✅ User enabled successfully",
        variant: "success",
      });
    });
  });

  it("should disable user successfully", async () => {
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
          message: "User disabled successfully",
        }),
      });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });

    // Open action menu for enabled user
    const moreButtons = screen
      .getAllByRole("button")
      .filter(
        (button) =>
          button.querySelector("svg")?.getAttribute("aria-hidden") === "true" &&
          button.querySelector("svg")?.classList.contains("lucide-ellipsis")
      );
    expect(moreButtons.length).toBeGreaterThan(0);
    await user.click(moreButtons[0]); // First user (enabled)

    // Click disable
    await user.click(await screen.findByText("Disable"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "✅ User disabled successfully",
        variant: "success",
      });
    });
  });
});
