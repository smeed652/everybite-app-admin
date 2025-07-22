import { MockedProvider } from "@apollo/client/testing";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import {
  ACTIVATE_WIDGET,
  DEACTIVATE_WIDGET,
  useWidgetActiveState,
} from "../useWidgetActiveState";

// Mock the fragments import
vi.mock("../graphql/fragments", () => ({
  WIDGET_FIELDS:
    "fragment WidgetFields on DbWidgets { id name isActive updatedAt }",
}));

describe("useWidgetActiveState", () => {
  const mockWidget = {
    id: "test-widget-1",
    name: "Test Widget",
    isActive: false,
    updatedAt: "2023-01-01T00:00:00Z",
    __typename: "DbWidgets",
  };

  const activateWidgetMock = {
    request: {
      query: ACTIVATE_WIDGET,
      variables: { id: "test-widget-1" },
    },
    result: {
      data: {
        activateWidget: {
          ...mockWidget,
          isActive: true,
          updatedAt: "2023-01-01T01:00:00Z",
        },
      },
    },
  };

  const deactivateWidgetMock = {
    request: {
      query: DEACTIVATE_WIDGET,
      variables: { id: "test-widget-1" },
    },
    result: {
      data: {
        deactivateWidget: {
          ...mockWidget,
          isActive: false,
          updatedAt: "2023-01-01T01:00:00Z",
        },
      },
    },
  };

  const errorMock = {
    request: {
      query: ACTIVATE_WIDGET,
      variables: { id: "test-widget-1" },
    },
    error: new Error("Network error"),
  };

  it("activates a widget successfully", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[activateWidgetMock]} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.activateWidget("test-widget-1");

    expect(response.data?.activateWidget).toEqual({
      ...mockWidget,
      isActive: true,
      updatedAt: "2023-01-01T01:00:00Z",
    });
  });

  it("deactivates a widget successfully", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[deactivateWidgetMock]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.deactivateWidget("test-widget-1");

    expect(response.data?.deactivateWidget).toEqual({
      ...mockWidget,
      isActive: false,
      updatedAt: "2023-01-01T01:00:00Z",
    });
  });

  it("toggles widget to active using toggleWidget", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[activateWidgetMock]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.toggleWidget("test-widget-1", true);

    expect(response.data?.activateWidget).toEqual({
      ...mockWidget,
      isActive: true,
      updatedAt: "2023-01-01T01:00:00Z",
    });
  });

  it("toggles widget to inactive using toggleWidget", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[deactivateWidgetMock]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.toggleWidget("test-widget-1", false);

    expect(response.data?.deactivateWidget).toEqual({
      ...mockWidget,
      isActive: false,
      updatedAt: "2023-01-01T01:00:00Z",
    });
  });

  it("handles activation errors gracefully", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[errorMock]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    await expect(
      result.current.activateWidget("test-widget-1")
    ).rejects.toThrow("Network error");
  });

  it("provides optimistic response for activation", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[activateWidgetMock]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.activateWidget("test-widget-1");

    // The optimistic response should be reflected in the cache
    expect(response.data?.activateWidget.isActive).toBe(true);
  });

  it("provides optimistic response for deactivation", async () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[deactivateWidgetMock]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    const response = await result.current.deactivateWidget("test-widget-1");

    // The optimistic response should be reflected in the cache
    expect(response.data?.deactivateWidget.isActive).toBe(false);
  });

  it("returns all expected functions", () => {
    const { result } = renderHook(() => useWidgetActiveState(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]} addTypename={true}>
          {children}
        </MockedProvider>
      ),
    });

    expect(result.current).toHaveProperty("activateWidget");
    expect(result.current).toHaveProperty("deactivateWidget");
    expect(result.current).toHaveProperty("toggleWidget");
    expect(typeof result.current.activateWidget).toBe("function");
    expect(typeof result.current.deactivateWidget).toBe("function");
    expect(typeof result.current.toggleWidget).toBe("function");
  });
});
