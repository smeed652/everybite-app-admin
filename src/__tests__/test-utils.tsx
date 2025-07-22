import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { render, RenderOptions } from "@testing-library/react";
import { DocumentNode } from "graphql";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";

// Mock data for tests
export const mockMetabaseUsers = {
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      dateJoined: "2024-01-15T10:00:00Z",
      lastLogin: "2024-12-01T15:30:00Z",
      isActive: true,
      isSuperuser: false,
      isQbnewb: false,
      locale: "en",
      ssoSource: null,
      updatedAt: "2024-12-01T15:30:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      dateJoined: "2024-02-20T09:00:00Z",
      lastLogin: "2024-12-02T14:20:00Z",
      isActive: true,
      isSuperuser: true,
      isQbnewb: false,
      locale: "en",
      ssoSource: "google",
      updatedAt: "2024-12-02T14:20:00Z",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Wilson",
      dateJoined: "2024-03-10T11:00:00Z",
      lastLogin: null,
      isActive: false,
      isSuperuser: false,
      isQbnewb: true,
      locale: "es",
      ssoSource: null,
      updatedAt: "2024-03-10T11:00:00Z",
    },
  ],
  total: 3,
};

export const mockWidgets = [
  {
    id: "1",
    createdAt: "2024-11-01T10:00:00Z",
    publishedAt: "2024-11-02T10:00:00Z",
  },
  {
    id: "2",
    createdAt: "2024-11-15T10:00:00Z",
    publishedAt: null,
  },
  {
    id: "3",
    createdAt: "2024-12-01T10:00:00Z",
    publishedAt: "2024-12-02T10:00:00Z",
  },
  {
    id: "4",
    createdAt: "2024-10-01T10:00:00Z",
    publishedAt: "2024-10-02T10:00:00Z",
  },
];

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialPath?: string;
  mocks?: MockedResponse[];
  addTypename?: boolean;
}

export const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialPath = "/",
    mocks = [],
    addTypename = false,
    ...renderOptions
  } = options;

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <MockedProvider mocks={mocks} addTypename={addTypename}>
        <ThemeProvider>
          <MemoryRouter
            initialEntries={[initialPath]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            {children}
          </MemoryRouter>
        </ThemeProvider>
      </MockedProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Mock fetch responses
export const createMockFetchResponse = (
  data: unknown,
  ok = true,
  status = 200
) => {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: () => Promise.resolve(data),
  } as Response);
};

export const createMockFetchError = (error: string) => {
  return Promise.reject(new Error(error));
};

// Mock environment variables
export const mockEnvVars = {
  VITE_METABASE_API_URL: "https://api.metabase.test",
  VITE_GRAPHQL_URI: "https://api.everybite.com/graphql",
  VITE_LOG_LEVEL: "debug",
};

// Test user roles
export const mockUserRoles = {
  ADMIN: ["ADMIN"],
  USER: ["USER"],
  GUEST: [],
};

// Helper to wait for loading states
export const waitForLoadingToFinish = async () => {
  // Wait for any loading indicators to disappear
  await new Promise((resolve) => setTimeout(resolve, 100));
};

// Helper to create GraphQL mocks
export const createGraphQLMock = (
  query: DocumentNode,
  data: unknown,
  error?: Error
) => {
  if (error) {
    return {
      request: { query },
      error,
    };
  }

  return {
    request: { query },
    result: { data },
  };
};

// Helper to mock authentication
export const mockAuth = {
  getCurrentUser: vi.fn(() => Promise.resolve({ username: "testuser" })),
  signOut: vi.fn(() => Promise.resolve()),
  fetchAuthSession: vi.fn(() =>
    Promise.resolve({
      accessToken: { payload: { "cognito:groups": ["ADMIN"] } },
    })
  ),
};

// Helper to mock AWS Amplify
export const mockAmplify = {
  fetchAuthSession: vi.fn(() =>
    Promise.resolve({
      accessToken: { payload: { "cognito:groups": ["ADMIN"] } },
    })
  ),
};

// Export everything for use in tests
export * from "@testing-library/react";
export { customRender as render };
