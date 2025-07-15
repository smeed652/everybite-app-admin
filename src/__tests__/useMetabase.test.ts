import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMetabaseUsers } from "../hooks/useMetabase";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.stubEnv(
  "VITE_METABASE_API_URL",
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws"
);

describe("useMetabaseUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("fetches users successfully", async () => {
    const mockUsers = {
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
      ],
      total: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response);

    const { result } = renderHook(() => useMetabaseUsers());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.users).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws/metabase/users"
    );
  });

  it("handles fetch errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useMetabaseUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toBe(null);
    expect(result.current.error).toBe("Network error");
  });

  it("handles non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const { result } = renderHook(() => useMetabaseUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toBe(null);
    expect(result.current.error).toBe("Failed to fetch Metabase users");
  });

  it("refetches data when refetch is called", async () => {
    const mockUsers = {
      users: [],
      total: 0,
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockUsers, total: 1 }),
      } as Response);

    const { result } = renderHook(() => useMetabaseUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users?.total).toBe(0);

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.users?.total).toBe(1);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("handles JSON parsing errors", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      redirected: false,
      type: "default" as ResponseType,
      url: "",
      json: async () => {
        throw new Error("Invalid JSON");
      },
      clone: () => mockResponse,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => "",
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMetabaseUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toBe(null);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("sets loading state correctly during fetch", async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useMetabaseUsers());

    // Should be loading initially
    expect(result.current.loading).toBe(true);

    // Resolve the fetch
    resolveFetch!({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      redirected: false,
      type: "default",
      url: "",
      json: async () => ({ users: [], total: 0 }),
    } as Response);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("handles empty response data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    const { result } = renderHook(() => useMetabaseUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("handles response without users array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0 }),
    } as Response);

    const { result } = renderHook(() => useMetabaseUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual({ total: 0 });
    expect(result.current.error).toBe(null);
  });
});
