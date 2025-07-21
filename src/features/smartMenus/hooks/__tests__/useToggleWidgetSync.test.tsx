/* eslint-disable @typescript-eslint/no-explicit-any */
import { MockedProvider } from "@apollo/client/testing";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ACTIVATE_WIDGET,
  DEACTIVATE_WIDGET,
  useToggleWidgetSync,
} from "../useToggleWidgetSync";

const activateMock = {
  request: {
    query: ACTIVATE_WIDGET,
    variables: { id: "abc" },
  },
  result: {
    data: {
      activateWidget: {
        id: "abc",
        isActive: true,
        updatedAt: "2023-01-01T00:00:00Z",
        __typename: "Widget",
      },
    },
  },
};

const deactivateMock = {
  request: {
    query: DEACTIVATE_WIDGET,
    variables: { id: "xyz" },
  },
  result: {
    data: {
      deactivateWidget: {
        id: "xyz",
        isActive: false,
        updatedAt: "2023-01-01T00:00:00Z",
        __typename: "Widget",
      },
    },
  },
};

describe("useToggleWidgetSync hook", () => {
  it("calls mutate with correct variables and optimistic response for activation", async () => {
    const { result } = renderHook(() => useToggleWidgetSync(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[activateMock]} addTypename>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.toggleWidgetSync("abc", true);
    expect(response.data.activateWidget.id).toBe("abc");
    expect(response.data.activateWidget.isActive).toBe(true);
  });

  it("uses deactivate mutation when enable is false", async () => {
    const { result } = renderHook(() => useToggleWidgetSync(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[deactivateMock]} addTypename>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.toggleWidgetSync("xyz", false);
    expect(response.data.deactivateWidget.id).toBe("xyz");
    expect(response.data.deactivateWidget.isActive).toBe(false);
  });

  it("returns the expected function", () => {
    const { result } = renderHook(() => useToggleWidgetSync(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]} addTypename>
          {children}
        </MockedProvider>
      ),
    });
    expect(result.current).toHaveProperty("toggleWidgetSync");
    expect(typeof result.current.toggleWidgetSync).toBe("function");
  });
});
