import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

// Set NODE_ENV to test to trigger the test environment detection
const originalEnv = process.env.NODE_ENV;
beforeEach(() => {
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

// Import after environment setup
import { useSyncWidget } from "./useSyncWidget";

describe("useSyncWidget", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useSyncWidget());

    expect(result.current.sync).toBeDefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("should call sync function", async () => {
    const { result } = renderHook(() => useSyncWidget());

    await act(async () => {
      const response = await result.current.sync("widget-123");
      expect(response).toEqual({
        data: { syncWidget: true },
      });
    });
  });

  it("should handle successful sync", async () => {
    const { result } = renderHook(() => useSyncWidget());

    await act(async () => {
      const response = await result.current.sync("widget-123");
      expect(response.data?.syncWidget).toBe(true);
    });

    expect(result.current.loading).toBe(false);
  });

  it("should handle sync with different widget IDs", async () => {
    const { result } = renderHook(() => useSyncWidget());

    await act(async () => {
      const response1 = await result.current.sync("widget-abc");
      const response2 = await result.current.sync("widget-def");

      expect(response1.data?.syncWidget).toBe(true);
      expect(response2.data?.syncWidget).toBe(true);
    });
  });

  it("should return consistent loading state", () => {
    const { result } = renderHook(() => useSyncWidget());

    expect(result.current.loading).toBe(false);
  });

  it("should return consistent error state", () => {
    const { result } = renderHook(() => useSyncWidget());

    expect(result.current.error).toBeUndefined();
  });
});
