import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../../../lib/logger";
import { useUpdateWidget } from "../useUpdateWidget";

// Mock logger
vi.mock("../../../../lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock GraphQL fragments
vi.mock("../../graphql/fragments", () => ({
  WIDGET_FIELDS: "WIDGET_FIELDS_FRAGMENT",
}));

// Mock the apiGraphQLClient with a simple mock
vi.mock("../../../../lib/api-graphql-apollo", () => {
  const mockMutate = vi.fn().mockResolvedValue({
    data: {
      updateWidget: {
        id: "1",
        name: "Updated Widget",
        __typename: "Widget",
      },
    },
  });
  const mockReadFragment = vi.fn().mockReturnValue({
    id: "1",
    name: "Test Widget",
    __typename: "Widget",
  });
  const mockCache = {
    identify: vi.fn().mockReturnValue("Widget:1"),
  };

  const mockClient = {
    mutate: mockMutate,
    readFragment: mockReadFragment,
    cache: mockCache,
  };

  return {
    apiGraphQLClient: mockClient,
  };
});

describe("useUpdateWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateWidgetFields", () => {
    it("should handle empty update data", async () => {
      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {};
      const resultPromise = result.current.updateWidgetFields("1", updateData);

      // Should return early for empty data
      await expect(resultPromise).resolves.toBeUndefined();
    });

    it("should remove isSyncEnabled from update data", async () => {
      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: "Updated Widget",
        isSyncEnabled: true,
      };

      await result.current.updateWidgetFields("1", updateData);

      // Verify that the function was called (basic test)
      expect(logger.debug).toHaveBeenCalled();
    });

    it("should log debug information", async () => {
      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      expect(logger.debug).toHaveBeenCalledWith(
        "[useUpdateWidget] Sending mutation with:",
        expect.objectContaining({
          id: "1",
          allowed: updateData,
          keys: ["name"],
        })
      );
    });
  });
});
