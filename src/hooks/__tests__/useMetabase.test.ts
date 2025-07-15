import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMetabaseMetrics, useMetabaseUsers } from "../useMetabase";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;

describe("useMetabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    // Clear any existing env vars
    delete process.env.VITE_METABASE_API_URL;
    delete process.env.REACT_APP_METABASE_API_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("useMetabaseMetrics", () => {
    it("should fetch metrics successfully", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      const mockMetrics = { totalUsers: 100, activeUsers: 75 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      const { result } = renderHook(() => useMetabaseMetrics());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.metrics).toBe(null);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/metabase/dashboard")
      );
    });

    it("should handle missing API URL", async () => {
      const { result } = renderHook(() => useMetabaseMetrics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Metabase API URL not configured");
      expect(result.current.metrics).toBe(null);
    });

    it("should handle network errors", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useMetabaseMetrics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.metrics).toBe(null);
    });

    it("should handle non-ok response", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useMetabaseMetrics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch Metabase metrics");
      expect(result.current.metrics).toBe(null);
    });

    it("should handle JSON parsing errors", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const { result } = renderHook(() => useMetabaseMetrics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Invalid JSON");
      expect(result.current.metrics).toBe(null);
    });

    it("should handle non-Error exceptions", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockRejectedValueOnce("String error");

      const { result } = renderHook(() => useMetabaseMetrics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch metrics");
      expect(result.current.metrics).toBe(null);
    });

    it("should support refetching", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      const mockMetrics = { totalUsers: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      const { result } = renderHook(() => useMetabaseMetrics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock second fetch with different data
      const refreshedMetrics = { totalUsers: 150 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => refreshedMetrics,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.metrics).toEqual(refreshedMetrics);
      });
    });
  });

  describe("useMetabaseUsers", () => {
    it("should fetch users successfully", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      const mockUsers = { users: [{ id: 1, name: "Test User" }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const { result } = renderHook(() => useMetabaseUsers());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.users).toBe(null);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/metabase/users")
      );
    });

    it("should handle missing API URL", async () => {
      const { result } = renderHook(() => useMetabaseUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Metabase API URL not configured");
      expect(result.current.users).toBe(null);
    });

    it("should handle network errors for users", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useMetabaseUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.users).toBe(null);
    });

    it("should handle non-ok response for users", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useMetabaseUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch Metabase users");
      expect(result.current.users).toBe(null);
    });

    it("should handle JSON parsing errors for users", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const { result } = renderHook(() => useMetabaseUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Invalid JSON");
      expect(result.current.users).toBe(null);
    });

    it("should handle non-Error exceptions for users", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      mockFetch.mockRejectedValueOnce("String error");

      const { result } = renderHook(() => useMetabaseUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch users");
      expect(result.current.users).toBe(null);
    });

    it("should support refetching users", async () => {
      process.env.VITE_METABASE_API_URL = "http://localhost:3000";
      const mockUsers = { users: [{ id: 1, name: "Test User" }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const { result } = renderHook(() => useMetabaseUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock second fetch with different data
      const refreshedUsers = { users: [{ id: 1, name: "Refreshed-User" }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => refreshedUsers,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.users).toEqual(refreshedUsers);
      });
    });
  });
});
