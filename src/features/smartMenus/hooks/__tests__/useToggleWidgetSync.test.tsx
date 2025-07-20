/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Create a mock client
const mockClient = {
  mutate: vi.fn().mockResolvedValue({
    data: {
      activateWidgetSync: {
        id: "abc",
        isSyncEnabled: true,
        __typename: "Widget",
      },
      deactivateWidgetSync: {
        id: "xyz",
        isSyncEnabled: false,
        __typename: "Widget",
      },
    },
  }),
};

// Mock the module
vi.mock("../../../lib/datawarehouse-lambda-apollo", () => ({
  lambdaClient: mockClient,
}));

import { useToggleWidgetSync } from "../useToggleWidgetSync";

describe("useToggleWidgetSync hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls mutate with correct variables and optimistic response for activation", async () => {
    const { result } = renderHook(() => useToggleWidgetSync());

    await result.current.toggleWidgetSync("abc", true);

    expect(mockClient.mutate).toHaveBeenCalledTimes(1);
    const call = mockClient.mutate.mock.calls[0][0];
    expect(call.variables).toEqual({ id: "abc" });
    expect(call.optimisticResponse).toMatchObject({
      activateWidgetSync: {
        id: "abc",
        isSyncEnabled: true,
        __typename: "Widget",
      },
    });
  });

  it("uses deactivate mutation when enable is false", async () => {
    const { result } = renderHook(() => useToggleWidgetSync());

    await result.current.toggleWidgetSync("xyz", false);

    const call = mockClient.mutate.mock.calls[0][0];
    expect(call.optimisticResponse).toMatchObject({
      deactivateWidgetSync: {
        id: "xyz",
        isSyncEnabled: false,
        __typename: "Widget",
      },
    });
  });

  it("returns the expected function", () => {
    const { result } = renderHook(() => useToggleWidgetSync());

    expect(result.current).toHaveProperty("toggleWidgetSync");
    expect(typeof result.current.toggleWidgetSync).toBe("function");
  });
});
