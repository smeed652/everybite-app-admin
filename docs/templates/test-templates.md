# Test Templates

## Component Test Template

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const renderComponent = (props = {}) => {
    return render(<ComponentName {...props} />);
  };

  beforeEach(() => {
    // Setup mocks and test data
  });

  afterEach(() => {
    // Cleanup
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with default props', () => {
      renderComponent();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      renderComponent({ title: 'Custom Title' });
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      renderComponent({ loading: true });
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error state', () => {
      renderComponent({ error: 'Something went wrong' });
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show empty state', () => {
      renderComponent({ data: [] });
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle button clicks', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      renderComponent({ onClick: mockOnClick });

      await user.click(screen.getByRole('button', { name: /click me/i }));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle form submissions', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      renderComponent({ onSubmit: mockOnSubmit });

      await user.type(screen.getByLabelText('Name'), 'Test Name');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'Test Name' });
    });

    it('should handle input changes', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      renderComponent({ onChange: mockOnChange });

      await user.type(screen.getByLabelText('Search'), 'test query');

      expect(mockOnChange).toHaveBeenCalledWith('test query');
    });
  });

  describe('data handling', () => {
    it('should display data correctly', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      renderComponent({ data: testData });

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle data updates', async () => {
      const { rerender } = renderComponent({ data: [] });

      expect(screen.getByText('No data available')).toBeInTheDocument();

      rerender(<ComponentName data={[{ id: '1', name: 'New Item' }]} />);

      expect(screen.getByText('New Item')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.tab();
      expect(screen.getByLabelText('Search')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /submit/i })).toHaveFocus();
    });
  });

  describe('edge cases', () => {
    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      renderComponent({ text: longText });

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const specialText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      renderComponent({ text: specialText });

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      const unicodeText = 'Test with unicode: 🍕🍔🌮🎉';
      renderComponent({ text: unicodeText });

      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });
  });
});
```

## Hook Test Template

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useCustomHook } from "./useCustomHook";

describe("useCustomHook", () => {
  beforeEach(() => {
    // Setup mocks
  });

  afterEach(() => {
    // Cleanup
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useCustomHook());

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should accept initial parameters", () => {
      const { result } = renderHook(() =>
        useCustomHook({ initialValue: "test" })
      );

      expect(result.current.data).toBe("test");
    });
  });

  describe("data fetching", () => {
    it("should fetch data successfully", async () => {
      const { result } = renderHook(() => useCustomHook());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it("should handle loading state", () => {
      const { result } = renderHook(() => useCustomHook());

      expect(result.current.loading).toBe(true);
    });

    it("should handle errors", async () => {
      // Mock service to throw error
      mockService.fetchData.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useCustomHook());

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
    });
  });

  describe("actions", () => {
    it("should handle refresh action", async () => {
      const { result } = renderHook(() => useCustomHook());

      await result.current.refresh();

      expect(mockService.fetchData).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it("should handle update action", async () => {
      const { result } = renderHook(() => useCustomHook());

      await result.current.update({ id: "1", name: "Updated" });

      expect(mockService.updateData).toHaveBeenCalledWith({
        id: "1",
        name: "Updated",
      });
    });

    it("should handle delete action", async () => {
      const { result } = renderHook(() => useCustomHook());

      await result.current.delete("1");

      expect(mockService.deleteData).toHaveBeenCalledWith("1");
    });
  });

  describe("caching", () => {
    it("should cache results", async () => {
      const { result } = renderHook(() => useCustomHook());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstData = result.current.data;

      // Trigger another fetch
      await result.current.refresh();

      // Should return cached data immediately
      expect(result.current.data).toBe(firstData);
    });

    it("should invalidate cache when needed", async () => {
      const { result } = renderHook(() => useCustomHook());

      await result.current.invalidateCache();

      expect(result.current.loading).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should cleanup on unmount", () => {
      const { unmount } = renderHook(() => useCustomHook());

      unmount();

      // Verify cleanup was called
      expect(mockService.cleanup).toHaveBeenCalled();
    });
  });
});
```

## Service Test Template

```typescript
import { ServiceName } from "./ServiceName";
import {
  createMockServiceResponse,
  createGraphQLError,
} from "../utils/service-layer-test-utils";

describe("ServiceName", () => {
  let service: ServiceName;

  beforeEach(() => {
    service = new ServiceName();
  });

  afterEach(() => {
    // Cleanup
    service.clearCache();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default configuration", () => {
      expect(service).toBeDefined();
      expect(service.getConfig()).toEqual(
        expect.objectContaining({
          timeout: 5000,
          retries: 3,
        })
      );
    });

    it("should accept custom configuration", () => {
      const customService = new ServiceName({
        timeout: 10000,
        retries: 5,
      });

      expect(customService.getConfig()).toEqual(
        expect.objectContaining({
          timeout: 10000,
          retries: 5,
        })
      );
    });
  });

  describe("data operations", () => {
    it("should fetch data successfully", async () => {
      const result = await service.getData();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it("should create data successfully", async () => {
      const newData = { name: "Test Item", value: 123 };

      const result = await service.createData(newData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(newData);
      expect(result.data.id).toBeDefined();
    });

    it("should update data successfully", async () => {
      const updateData = { id: "1", name: "Updated Item" };

      const result = await service.updateData(updateData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Updated Item");
    });

    it("should delete data successfully", async () => {
      const result = await service.deleteData("1");

      expect(result.success).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockApiClient.request.mockRejectedValue(new Error("Network error"));

      await expect(service.getData()).rejects.toThrow("Network error");
    });

    it("should handle GraphQL errors", async () => {
      const graphQLError = createApolloError([
        createGraphQLError("Field not found", ["data", "name"]),
      ]);

      mockApiClient.request.mockRejectedValue(graphQLError);

      await expect(service.getData()).rejects.toThrow("Apollo Error");
    });

    it("should handle validation errors", async () => {
      const invalidData = { name: "", value: -1 };

      await expect(service.createData(invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it("should handle timeout errors", async () => {
      mockApiClient.request.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 6000)
          )
      );

      await expect(service.getData()).rejects.toThrow("Timeout");
    });
  });

  describe("caching", () => {
    it("should cache successful responses", async () => {
      const result1 = await service.getData();
      const result2 = await service.getData();

      expect(result1).toEqual(result2);
      expect(service.getCacheStats().hitCount).toBe(1);
    });

    it("should invalidate cache on updates", async () => {
      await service.getData(); // Populate cache

      await service.updateData({ id: "1", name: "Updated" });

      expect(service.getCacheStats().hitCount).toBe(0);
    });

    it("should handle cache expiration", async () => {
      // Set short cache TTL
      const shortCacheService = new ServiceName({ cacheTTL: 100 });

      await shortCacheService.getData();

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 200));

      const result = await shortCacheService.getData();
      expect(shortCacheService.getCacheStats().hitCount).toBe(0);
    });
  });

  describe("performance", () => {
    it("should complete within time limit", async () => {
      const startTime = performance.now();

      await service.getData();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it("should handle concurrent requests", async () => {
      const concurrentRequests = Array(5)
        .fill(null)
        .map(() => service.getData());

      const results = await Promise.all(concurrentRequests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe("retry logic", () => {
    it("should retry failed requests", async () => {
      let attemptCount = 0;
      mockApiClient.request.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error("Temporary failure");
        }
        return Promise.resolve({ data: [] });
      });

      const result = await service.getData();

      expect(attemptCount).toBe(3);
      expect(result.success).toBe(true);
    });

    it("should not retry on validation errors", async () => {
      mockApiClient.request.mockRejectedValue(
        new ValidationError("Invalid data")
      );

      await expect(service.getData()).rejects.toThrow(ValidationError);

      expect(mockApiClient.request).toHaveBeenCalledTimes(1); // No retries
    });
  });
});
```

## API Test Template

```typescript
import request from "supertest";
import { app } from "../app";

describe("API Endpoints", () => {
  describe("GET /api/resource", () => {
    it("should return 200 and data for valid requests", async () => {
      const response = await request(app)
        .get("/api/resource")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it("should return 401 for missing authentication", async () => {
      const response = await request(app).get("/api/resource");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 403 for invalid permissions", async () => {
      const response = await request(app)
        .get("/api/resource")
        .set("Authorization", "Bearer insufficient-permissions-token");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "Forbidden");
    });

    it("should handle query parameters", async () => {
      const response = await request(app)
        .get("/api/resource?limit=10&offset=0")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
    });

    it("should validate query parameters", async () => {
      const response = await request(app)
        .get("/api/resource?limit=invalid&offset=-1")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/resource", () => {
    it("should create resource with valid data", async () => {
      const validData = { name: "Test Resource", value: 123 };

      const response = await request(app)
        .post("/api/resource")
        .set("Authorization", "Bearer valid-token")
        .send(validData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toMatchObject(validData);
      expect(response.body.data.id).toBeDefined();
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = { name: "", value: -1 };

      const response = await request(app)
        .post("/api/resource")
        .set("Authorization", "Bearer valid-token")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it("should handle duplicate resources", async () => {
      const duplicateData = { name: "Existing Resource", value: 123 };

      const response = await request(app)
        .post("/api/resource")
        .set("Authorization", "Bearer valid-token")
        .send(duplicateData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "Resource already exists");
    });
  });

  describe("PUT /api/resource/:id", () => {
    it("should update resource with valid data", async () => {
      const updateData = { name: "Updated Resource", value: 456 };

      const response = await request(app)
        .put("/api/resource/1")
        .set("Authorization", "Bearer valid-token")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject(updateData);
    });

    it("should return 404 for non-existent resource", async () => {
      const response = await request(app)
        .put("/api/resource/999")
        .set("Authorization", "Bearer valid-token")
        .send({ name: "Updated Resource" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Resource not found");
    });
  });

  describe("DELETE /api/resource/:id", () => {
    it("should delete existing resource", async () => {
      const response = await request(app)
        .delete("/api/resource/1")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(204);
    });

    it("should return 404 for non-existent resource", async () => {
      const response = await request(app)
        .delete("/api/resource/999")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(404);
    });
  });

  describe("error handling", () => {
    it("should handle internal server errors", async () => {
      // Mock service to throw error
      mockService.getData.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/resource")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error");
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/resource")
        .set("Authorization", "Bearer valid-token")
        .set("Content-Type", "application/json")
        .send("invalid json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid JSON");
    });

    it("should handle request timeout", async () => {
      // Mock service to timeout
      mockService.getData.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 6000)
          )
      );

      const response = await request(app)
        .get("/api/resource")
        .set("Authorization", "Bearer valid-token")
        .timeout(5000);

      expect(response.status).toBe(408);
    });
  });

  describe("rate limiting", () => {
    it("should enforce rate limits", async () => {
      const requests = Array(11)
        .fill(null)
        .map(() =>
          request(app)
            .get("/api/resource")
            .set("Authorization", "Bearer valid-token")
        );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find((r) => r.status === 429);

      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse.body).toHaveProperty(
        "error",
        "Too many requests"
      );
    });
  });
});
```

## Usage Instructions

1. **Copy the appropriate template** for your component/service
2. **Replace placeholder names** with actual component/service names
3. **Customize the tests** based on your specific functionality
4. **Add edge cases** specific to your implementation
5. **Update mocks** to match your actual dependencies
6. **Follow the AAA pattern** (Arrange, Act, Assert)
7. **Test both success and failure scenarios**
8. **Include accessibility tests** for components
9. **Add performance tests** where appropriate

## Best Practices

- **Test behavior, not implementation**
- **Use descriptive test names**
- **Test one thing at a time**
- **Keep tests independent**
- **Use appropriate assertions**
- **Mock external dependencies**
- **Test edge cases and error scenarios**
- **Include accessibility considerations**
- **Measure performance where relevant**

---

_These templates should be updated as we discover new patterns and requirements._
