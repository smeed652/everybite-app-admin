import { render, screen, waitFor } from "@testing-library/react";
import { fetchAuthSession } from "aws-amplify/auth";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

// Mock AWS Amplify
vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

// Mock Apollo Client
vi.mock("@apollo/client", () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="apollo-provider">{children}</div>
  ),
  useQuery: () => ({
    data: null,
    loading: false,
    error: null,
  }),
  useApolloClient: () => ({
    query: vi.fn(),
    mutate: vi.fn(),
  }),
  gql: vi.fn((strings, ...args) => ({ strings, args })),
  createHttpLink: vi.fn(() => ({})),
  InMemoryCache: vi.fn(() => ({})),
  ApolloClient: vi.fn(() => ({})),
  ApolloLink: {
    from: vi.fn(() => ({
      request: vi.fn(),
      concat: vi.fn(() => ({})),
    })),
  },
  setContext: vi.fn(() => ({})),
  onError: vi.fn(() => ({})),
  fromPromise: vi.fn(() => ({})),
}));

// Mock Observable
vi.mock("zen-observable-ts", () => ({
  Observable: {
    of: vi.fn(() => ({})),
  },
}));

// Mock datawarehouse-lambda-apollo to prevent real Apollo Client creation
vi.mock("../lib/datawarehouse-lambda-apollo", () => ({
  metabaseClient: null,
  reinitializeMetabaseClient: vi.fn(),
  cacheUtils: {
    clearCache: vi.fn(),
    getCacheStatus: vi.fn(() => ({ enabled: false })),
    refreshOperation: vi.fn(),
    isEnabled: vi.fn(() => false),
  },
  startScheduledRefresh: vi.fn(),
  stopScheduledRefresh: vi.fn(),
  getScheduledRefreshInfo: vi.fn(() => ({ enabled: false })),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock the auth context
const mockLogin = vi.fn();
const mockLogout = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    accessToken: null,
    user: null,
    login: mockLogin,
    logout: mockLogout,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock the auth config check
vi.mock("../components/AuthConfigCheck", () => ({
  AuthConfigCheck: () => <div data-testid="auth-config-check" />,
}));

describe("Authentication Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    // Reset environment
    delete import.meta.env.VITE_E2E;
    if (typeof process !== "undefined") {
      delete process.env.NODE_ENV;
    }
  });

  const renderApp = () => {
    return render(
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </BrowserRouter>
    );
  };

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing protected routes without authentication", async () => {
      // Mock empty session (no tokens) - this is the key fix we implemented
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
        credentials: undefined,
        identityId: undefined,
        userSub: undefined,
      });

      // Start at a protected route
      window.history.pushState({}, "", "/smartmenus");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });
    });

    it("should redirect to login when session has undefined tokens", async () => {
      // Mock session with undefined tokens
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      window.history.pushState({}, "", "/smartmenus");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });
    });

    it("should redirect to login when session has null tokens", async () => {
      // Mock session with null tokens
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      window.history.pushState({}, "", "/smartmenus");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });
    });

    it("should redirect to login when fetchAuthSession throws an error", async () => {
      // Mock fetchAuthSession to throw
      vi.mocked(fetchAuthSession).mockRejectedValue(new Error("No session"));

      window.history.pushState({}, "", "/smartmenus");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });
    });

    it("should allow access to login page when not authenticated", async () => {
      // Mock empty session
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: undefined,
        userSub: undefined,
      });

      window.history.pushState({}, "", "/login");
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("email")).toBeInTheDocument();
        expect(screen.getByTestId("password")).toBeInTheDocument();
        expect(screen.getByTestId("login-submit")).toBeInTheDocument();
      });
      expect(window.location.pathname).toBe("/login");
    });

    it("should allow access to 403 page when not authenticated", async () => {
      // Mock empty session
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: undefined,
        userSub: undefined,
      });

      window.history.pushState({}, "", "/403");
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("forbidden-page")).toBeInTheDocument();
        expect(
          screen.getByText("You do not have permission to access this page.")
        ).toBeInTheDocument();
      });
      expect(window.location.pathname).toBe("/403");
    });
  });

  describe("Authenticated Access", () => {
    it("should allow access to protected routes when authenticated with valid tokens", async () => {
      // Mock valid session with tokens
      vi.mocked(fetchAuthSession).mockResolvedValue({
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
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      window.history.pushState({}, "", "/smartmenus");
      renderApp();

      await waitFor(() => {
        expect(screen.getAllByText("SmartMenus").length).toBeGreaterThan(0);
      });
      expect(window.location.pathname).toBe("/smartmenus");
    });

    it("should allow access to dashboard when authenticated", async () => {
      // Mock valid session
      vi.mocked(fetchAuthSession).mockResolvedValue({
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
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      window.history.pushState({}, "", "/");
      renderApp();

      await waitFor(() => {
        expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
      });
      expect(window.location.pathname).toBe("/");
    });
  });

  describe("Role-based Access Control", () => {
    it("should allow admin access to admin routes when user has ADMIN role", async () => {
      // Mock session with ADMIN role
      vi.mocked(fetchAuthSession).mockResolvedValue({
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
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      // Mock API calls for Users page
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          users: [
            {
              username: "testuser",
              email: "test@example.com",
              status: "CONFIRMED",
              enabled: true,
              created: "2024-01-01T00:00:00Z",
            },
          ],
        }),
      } as Response);

      window.history.pushState({}, "", "/users");
      renderApp();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Users" })
        ).toBeInTheDocument();
      });
      expect(window.location.pathname).toBe("/users");
    });

    it("should redirect to 403 when non-admin user accesses admin routes", async () => {
      // Mock session with USER role (not ADMIN)
      vi.mocked(fetchAuthSession).mockResolvedValue({
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

      window.history.pushState({}, "", "/users");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/403");
      });
    });

    it("should redirect to login when authenticated user has no groups", async () => {
      // Mock session with no groups
      vi.mocked(fetchAuthSession).mockResolvedValue({
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
        credentials: { accessKeyId: "a", secretAccessKey: "b" },
        identityId: "test-identity",
        userSub: "test-user",
      });

      window.history.pushState({}, "", "/users");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });
    });
  });

  describe("Test Environment Bypass", () => {
    it("should not use localStorage bypass in production environment", async () => {
      // Ensure not in test environment
      delete import.meta.env.VITE_E2E;

      // Mock localStorage token (should be ignored)
      localStorage.setItem("everybiteAuth", "invalid-token");

      // Mock empty session
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: undefined,
        credentials: undefined,
        identityId: undefined,
        userSub: undefined,
      });

      window.history.pushState({}, "", "/smartmenus");
      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });

      // Should call fetchAuthSession even with localStorage token
      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
    });
  });
});
