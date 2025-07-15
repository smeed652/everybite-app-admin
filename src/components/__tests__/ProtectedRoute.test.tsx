import { render, screen, waitFor } from "@testing-library/react";
import { fetchAuthSession } from "aws-amplify/auth";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../ProtectedRoute";

// Mock AWS Amplify
vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

// Mock React Router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return (
        <div data-testid="navigate" data-to={to}>
          Navigate to {to}
        </div>
      );
    },
  };
});

describe("ProtectedRoute", () => {
  const mockFetchAuthSession = vi.mocked(fetchAuthSession);

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset environment
    delete import.meta.env.VITE_E2E;
    if (typeof process !== "undefined") {
      delete process.env.NODE_ENV;
    }
  });

  const renderProtectedRoute = (
    props: {
      children?: React.ReactElement;
      allowedRoles?: string[];
    } = {}
  ) => {
    const {
      children = <div data-testid="protected-content">Protected Content</div>,
      allowedRoles,
    } = props;

    return render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
      </MemoryRouter>
    );
  };

  describe("Authentication Logic", () => {
    it("should show loading state initially", () => {
      mockFetchAuthSession.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderProtectedRoute();

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("should redirect to login when no valid session exists", async () => {
      // Mock empty session (no tokens)
      mockFetchAuthSession.mockResolvedValue({
        tokens: undefined,
        credentials: undefined,
        identityId: undefined,
        userSub: undefined,
      });

      renderProtectedRoute();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("should allow access when valid session exists", async () => {
      // Mock valid session with tokens
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: { toString: () => "valid-access-token" },
          idToken: { toString: () => "valid-id-token" },
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute();

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should redirect to login when fetchAuthSession throws", async () => {
      mockFetchAuthSession.mockRejectedValue(new Error("No session"));

      renderProtectedRoute();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("should redirect to login when session has no tokens", async () => {
      // Mock session with undefined tokens
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: undefined,
          idToken: undefined,
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Role-based Access Control", () => {
    it("should allow access when user has required role", async () => {
      // Mock session with ADMIN role
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: {
            toString: () => "valid-access-token",
            payload: { "cognito:groups": ["ADMIN"] },
          },
          idToken: {
            toString: () => "valid-id-token",
            payload: { "cognito:groups": ["ADMIN"] },
          },
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute({ allowedRoles: ["ADMIN"] });

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should redirect to 403 when user lacks required role", async () => {
      // Mock session with USER role (not ADMIN)
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: {
            toString: () => "valid-access-token",
            payload: { "cognito:groups": ["USER"] },
          },
          idToken: {
            toString: () => "valid-id-token",
            payload: { "cognito:groups": ["USER"] },
          },
        },
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute({ allowedRoles: ["ADMIN"] });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/403");
      });
    });

    it("should redirect to login when user has no groups", async () => {
      // Mock session with no groups
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: {
            toString: () => "valid-access-token",
            payload: { "cognito:groups": [] },
          },
          idToken: {
            toString: () => "valid-id-token",
            payload: { "cognito:groups": [] },
          },
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute({ allowedRoles: ["ADMIN"] });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("should allow access when no roles are specified", async () => {
      // Mock valid session
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: { toString: () => "valid-access-token" },
          idToken: { toString: () => "valid-id-token" },
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute(); // No allowedRoles specified

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Test Environment Bypass", () => {
    it("should use localStorage bypass in test environment", async () => {
      // Set up test environment
      import.meta.env.VITE_E2E = "true";

      // Mock localStorage token
      const mockToken = JSON.stringify({
        groups: ["ADMIN"],
        sub: "test-user",
      });
      localStorage.setItem("everybiteAuth", mockToken);

      renderProtectedRoute({ allowedRoles: ["ADMIN"] });

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });

      // Should not call fetchAuthSession in test environment
      expect(mockFetchAuthSession).not.toHaveBeenCalled();
    });

    it("should not use localStorage bypass in production", async () => {
      // Ensure not in test environment
      delete import.meta.env.VITE_E2E;

      // Mock localStorage token (should be ignored)
      localStorage.setItem("everybiteAuth", "invalid-token");

      // Mock empty session
      mockFetchAuthSession.mockResolvedValue({
        tokens: undefined,
        credentials: undefined,
        identityId: undefined,
        userSub: undefined,
      });

      renderProtectedRoute();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });

      // Should call fetchAuthSession even with localStorage token
      expect(mockFetchAuthSession).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed localStorage token in test environment", async () => {
      // Set up test environment
      import.meta.env.VITE_E2E = "true";

      // Mock malformed localStorage token
      localStorage.setItem("everybiteAuth", "invalid-json");

      // Mock valid session (fallback)
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: { toString: () => "valid-access-token" },
          idToken: { toString: () => "valid-id-token" },
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute();

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });

      // Should fall back to fetchAuthSession
      expect(mockFetchAuthSession).toHaveBeenCalled();
    });

    it("should handle different token payload structures", async () => {
      // Mock session with different payload structure
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: {
            toString: () => "valid-access-token",
            payload: { "cognito:groups": "ADMIN" }, // String instead of array
          },
          idToken: {
            toString: () => "valid-id-token",
            payload: { "cognito:groups": "ADMIN" },
          },
        },
        credentials: {},
        identityId: "test-identity",
        userSub: "test-user",
      });

      renderProtectedRoute({ allowedRoles: ["ADMIN"] });

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
