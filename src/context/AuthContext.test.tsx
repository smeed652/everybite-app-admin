import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("jwt-decode", () => ({
  default: vi.fn(),
}));

vi.mock("../lib/auth", () => ({
  signOut: vi.fn(),
  currentSession: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    assign: vi.fn(),
  },
  writable: true,
});

// Import after mocks
import jwtDecode from "jwt-decode";
import { currentSession, signOut } from "../lib/auth";
import { AuthProvider, getAccessToken, useAuth } from "./AuthContext";

const mockJwtDecode = jwtDecode as ReturnType<typeof vi.fn>;
const mockSignOut = signOut as ReturnType<typeof vi.fn>;
const mockCurrentSession = currentSession as ReturnType<typeof vi.fn>;

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
  });

  describe("getAccessToken", () => {
    it("returns token from localStorage", () => {
      const token = "test-token";
      mockLocalStorage.getItem.mockReturnValue(token);

      const result = getAccessToken();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("eb_access_token");
      expect(result).toBe(token);
    });

    it("returns null when no token in localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getAccessToken();

      expect(result).toBe(null);
    });
  });

  describe("AuthProvider", () => {
    const TestComponent = () => {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="access-token">{auth.accessToken || "null"}</span>
          <span data-testid="user-sub">{auth.user?.sub || "null"}</span>
          <button onClick={() => auth.login({ accessToken: "new-token" })}>
            Login
          </button>
          <button onClick={() => auth.logout()}>Logout</button>
        </div>
      );
    };

    it("provides initial null state", () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("access-token")).toHaveTextContent("null");
      expect(screen.getByTestId("user-sub")).toHaveTextContent("null");
    });

    it("loads session on mount", async () => {
      const mockSession = {
        tokens: {
          idToken: {
            toString: () => "session-token",
          },
        },
      };
      mockCurrentSession.mockResolvedValue(mockSession);
      const mockUser = { sub: "session-user" };
      mockJwtDecode.mockReturnValue(mockUser);

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      expect(mockCurrentSession).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "eb_access_token",
        "session-token"
      );
    });

    it("handles session load error", async () => {
      mockCurrentSession.mockRejectedValue(new Error("Session error"));

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "eb_access_token"
      );
    });

    it("updates state when login is called", async () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));
      const mockUser = { sub: "login-user" };
      mockJwtDecode.mockReturnValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial render
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        screen.getByText("Login").click();
      });

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId("access-token")).toHaveTextContent("new-token");
      expect(screen.getByTestId("user-sub")).toHaveTextContent("login-user");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "eb_access_token",
        "new-token"
      );
    });

    it("updates localStorage when accessToken changes", async () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText("Login").click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "eb_access_token",
        "new-token"
      );
    });

    it("removes from localStorage when accessToken is null", async () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // First login to set a token
      await act(async () => {
        screen.getByText("Login").click();
      });

      // Then logout to clear it
      await act(async () => {
        screen.getByText("Logout").click();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "eb_access_token"
      );
    });
  });

  describe("useAuth hook", () => {
    it("throws error when used outside AuthProvider", () => {
      const TestComponent = () => {
        useAuth();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useAuth must be used within AuthProvider"
      );
    });

    it("returns auth context when used within AuthProvider", () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));

      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <span data-testid="has-login">{typeof auth.login}</span>
            <span data-testid="has-logout">{typeof auth.logout}</span>
            <span data-testid="has-access-token">
              {typeof auth.accessToken}
            </span>
            <span data-testid="has-user">{typeof auth.user}</span>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("has-login")).toHaveTextContent("function");
      expect(screen.getByTestId("has-logout")).toHaveTextContent("function");
      expect(screen.getByTestId("has-access-token")).toHaveTextContent(
        "object"
      );
      expect(screen.getByTestId("has-user")).toHaveTextContent("object");
    });
  });

  describe("logout functionality", () => {
    it("calls amplify signOut and clears state", async () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));
      mockSignOut.mockResolvedValue(undefined);

      const TestComponent = () => {
        const auth = useAuth();
        return <button onClick={() => auth.logout()}>Logout</button>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText("Logout").click();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "eb_access_token"
      );
      expect(window.location.assign).toHaveBeenCalledWith("/login");
    });

    it("handles signOut error gracefully", async () => {
      mockCurrentSession.mockRejectedValue(new Error("No session"));
      mockSignOut.mockRejectedValue(new Error("Network error"));

      const TestComponent = () => {
        const auth = useAuth();
        return <button onClick={() => auth.logout()}>Logout</button>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText("Logout").click();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "eb_access_token"
      );
      expect(window.location.assign).toHaveBeenCalledWith("/login");
    });
  });
});
