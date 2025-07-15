import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../../../lib/logger";
import { useUpdateWidget } from "../useUpdateWidget";

// Define Apollo error types for testing
interface ApolloError extends Error {
  graphQLErrors?: Array<{ message: string }>;
  networkError?: {
    statusCode?: number;
    bodyText?: string;
    result?: unknown;
    name?: string;
    message?: string;
    stack?: string;
  };
}

// Mock Apollo Client
const mockMutate = vi.fn();
const mockReadFragment = vi.fn();
const mockCache = {
  identify: vi.fn(),
};

const mockClient = {
  mutate: mockMutate,
  readFragment: mockReadFragment,
  cache: mockCache,
};

vi.mock("@apollo/client", () => ({
  useApolloClient: vi.fn(() => mockClient),
  gql: vi.fn((query) => ({ loc: { source: { body: query } } })),
}));

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

describe("useUpdateWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCache.identify.mockReturnValue("Widget:1");
  });

  describe("updateWidgetFields", () => {
    it("should update widget fields successfully", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        description: "Test Description",
        __typename: "Widget",
      };

      const mockResponse = {
        data: {
          updateWidget: {
            ...mockWidget,
            name: "Updated Widget",
          },
        },
      };

      mockMutate.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: { id: "1", name: "Updated Widget" },
        },
        optimisticResponse: expect.any(Object),
      });

      expect(logger.debug).toHaveBeenCalledWith(
        "[useUpdateWidget] Sending mutation with:",
        expect.objectContaining({
          id: "1",
          allowed: updateData,
          keys: ["name"],
        })
      );
    });

    it("should handle empty update data", async () => {
      const { result } = renderHook(() => useUpdateWidget());

      await result.current.updateWidgetFields("1", {});

      expect(mockMutate).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should remove isSyncEnabled from update data", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: "Updated Widget",
        isSyncEnabled: true,
      };

      await result.current.updateWidgetFields("1", updateData);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: { id: "1", name: "Updated Widget" },
        },
        optimisticResponse: expect.any(Object),
      });

      // Verify isSyncEnabled was removed
      expect(mockMutate.mock.calls[0][0].variables.input).not.toHaveProperty(
        "isSyncEnabled"
      );
    });

    it("should create optimistic response with existing widget data", async () => {
      const existingWidget = {
        id: "1",
        name: "Original Widget",
        description: "Original Description",
        updatedAt: "2024-01-01T00:00:00Z",
        __typename: "Widget",
      };

      const mockWidget = {
        id: "1",
        name: "Updated Widget",
        __typename: "Widget",
      };

      mockReadFragment.mockReturnValue(existingWidget);
      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      const optimisticResponse = mockMutate.mock.calls[0][0].optimisticResponse;
      expect(optimisticResponse.updateWidget).toEqual({
        ...existingWidget,
        ...updateData,
        updatedAt: expect.any(String),
      });
    });

    it("should create optimistic response with minimal data when no existing widget", async () => {
      const mockWidget = {
        id: "1",
        name: "Updated Widget",
        __typename: "Widget",
      };

      mockReadFragment.mockReturnValue(null);
      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      const optimisticResponse = mockMutate.mock.calls[0][0].optimisticResponse;
      expect(optimisticResponse.updateWidget).toEqual({
        id: "1",
        ...updateData,
        updatedAt: expect.any(String),
        __typename: "Widget",
      });
    });

    it("should handle GraphQL errors", async () => {
      const graphQLError = new Error("GraphQL Error") as ApolloError;
      graphQLError.graphQLErrors = [{ message: "Field error" }];
      graphQLError.networkError = undefined;

      mockMutate.mockRejectedValue(graphQLError);

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };

      await expect(
        result.current.updateWidgetFields("1", updateData)
      ).rejects.toThrow("GraphQL Error");

      expect(logger.error).toHaveBeenCalledWith(
        "[useUpdateWidget] GraphQL Error:",
        {
          error: graphQLError,
          message: "GraphQL Error",
          graphQLErrors: [{ message: "Field error" }],
          networkError: null,
          input: { id: "1", name: "Updated Widget" },
        }
      );
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error") as ApolloError;
      networkError.networkError = {
        statusCode: 500,
        bodyText: "Internal Server Error",
        result: { error: "Server error" },
        name: "NetworkError",
        message: "Network Error",
        stack: "Error stack",
      };

      mockMutate.mockRejectedValue(networkError);

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };

      await expect(
        result.current.updateWidgetFields("1", updateData)
      ).rejects.toThrow("Network Error");

      expect(logger.error).toHaveBeenCalledWith(
        "[useUpdateWidget] Network Error Details:",
        {
          statusCode: 500,
          bodyText: "Internal Server Error",
          result: { error: "Server error" },
          name: "NetworkError",
          message: "Network Error",
          stack: "Error stack",
        }
      );
    });

    it("should log full error object", async () => {
      const error = new Error("Test Error");
      mockMutate.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };

      await expect(
        result.current.updateWidgetFields("1", updateData)
      ).rejects.toThrow("Test Error");

      expect(logger.error).toHaveBeenCalledWith(
        "[useUpdateWidget] Full Error Object:",
        JSON.stringify(error, null, 2)
      );
    });

    it("should create dynamic GraphQL mutation based on update fields", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: "Updated Widget",
        description: "New Description",
      };
      await result.current.updateWidgetFields("1", updateData);

      const mutationCall = mockMutate.mock.calls[0][0];
      expect(mutationCall.mutation).toBeDefined();
      expect(mutationCall.mutation.loc?.source.body).toContain(
        "mutation UpdateWidget"
      );
      expect(mutationCall.mutation.loc?.source.body).toContain("name");
      expect(mutationCall.mutation.loc?.source.body).toContain("description");
    });

    it("should handle multiple field updates", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        description: "Test Description",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: "Updated Widget",
        description: "Updated Description",
        isActive: true,
      };

      await result.current.updateWidgetFields("1", updateData);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: {
            id: "1",
            name: "Updated Widget",
            description: "Updated Description",
            isActive: true,
          },
        },
        optimisticResponse: expect.any(Object),
      });

      expect(logger.debug).toHaveBeenCalledWith(
        "[useUpdateWidget] Sending mutation with:",
        expect.objectContaining({
          keys: ["name", "description", "isActive"],
        })
      );
    });

    it("should handle null and undefined values in update data", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: null,
        description: undefined,
        isActive: false,
      };

      await result.current.updateWidgetFields("1", updateData);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: {
            id: "1",
            name: null,
            description: undefined,
            isActive: false,
          },
        },
        optimisticResponse: expect.any(Object),
      });
    });

    it("should handle complex nested objects in update data", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: "Updated Widget",
        settings: {
          theme: "dark",
          language: "en",
        },
        metadata: {
          tags: ["tag1", "tag2"],
          version: 1.0,
        },
      };

      await result.current.updateWidgetFields("1", updateData);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: { id: "1", ...updateData },
        },
        optimisticResponse: expect.any(Object),
      });
    });
  });

  describe("GraphQL mutation generation", () => {
    it("should generate mutation with correct selection set", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = {
        name: "Updated Widget",
        description: "New Description",
      };
      await result.current.updateWidgetFields("1", updateData);

      const mutationBody =
        mockMutate.mock.calls[0][0].mutation.loc?.source.body;
      expect(mutationBody).toContain(
        "mutation UpdateWidget($input: UpdateWidget!)"
      );
      expect(mutationBody).toContain("updateWidget(input: $input)");
      expect(mutationBody).toContain("id");
      expect(mutationBody).toContain("name");
      expect(mutationBody).toContain("description");
      expect(mutationBody).toContain("__typename");
    });

    it("should log the generated GraphQL mutation", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      expect(logger.debug).toHaveBeenCalledWith(
        "[useUpdateWidget] GraphQL Mutation:",
        expect.stringContaining("mutation UpdateWidget")
      );
    });
  });

  describe("Cache operations", () => {
    it("should use correct cache identification", async () => {
      const mockWidget = {
        id: "1",
        name: "Test Widget",
        __typename: "Widget",
      };

      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      expect(mockCache.identify).toHaveBeenCalledWith({
        __typename: "Widget",
        id: "1",
      });
      expect(mockReadFragment).toHaveBeenCalledWith({
        id: "Widget:1",
        fragment: "WIDGET_FIELDS_FRAGMENT",
      });
    });

    it("should handle cache miss gracefully", async () => {
      const mockWidget = {
        id: "1",
        name: "Updated Widget",
        __typename: "Widget",
      };

      mockReadFragment.mockReturnValue(null);
      mockMutate.mockResolvedValue({ data: { updateWidget: mockWidget } });

      const { result } = renderHook(() => useUpdateWidget());

      const updateData = { name: "Updated Widget" };
      await result.current.updateWidgetFields("1", updateData);

      // Should still create optimistic response with minimal data
      const optimisticResponse = mockMutate.mock.calls[0][0].optimisticResponse;
      expect(optimisticResponse.updateWidget.id).toBe("1");
      expect(optimisticResponse.updateWidget.name).toBe("Updated Widget");
    });
  });
});
