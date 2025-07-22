import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { ToastProvider } from "../../../components/ui/ToastProvider";
import { AuthProvider } from "../../../context/AuthContext";
import Users from "../../Users";

// Mock fetch
export const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useToast hook
export const mockShowToast = vi.fn();
vi.mock("../../../components/ui/ToastProvider", async () => {
  const actual = await vi.importActual("../../../components/ui/ToastProvider");
  return {
    ...actual,
    useToast: vi.fn(() => ({ showToast: mockShowToast })),
  };
});

// Mock AuthContext
export const mockAuthContext = {
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

export const mockUsers = [
  {
    username: "user1",
    email: "user1@example.com",
    status: "CONFIRMED",
    enabled: true,
    created: "2024-12-30T00:00:00.000Z",
  },
  {
    username: "user2",
    email: "user2@example.com",
    status: "UNCONFIRMED",
    enabled: false,
    created: "2024-12-31T00:00:00.000Z",
  },
];

export const renderUsers = () => {
  return render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <ToastProvider>
          <Users />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export const setupTestEnvironment = () => {
  vi.clearAllMocks();
  vi.stubEnv("VITE_METABASE_API_URL", "http://localhost:3001");
};
