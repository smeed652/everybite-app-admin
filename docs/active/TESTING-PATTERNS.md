# Testing Patterns & Best Practices

## Overview

This document outlines the testing patterns and best practices used in the EveryBite Admin Application. These patterns ensure consistent, maintainable, and effective tests across the codebase.

## Test Structure

### AAA Pattern (Arrange, Act, Assert)

All tests should follow the AAA pattern for clarity and consistency:

```typescript
describe("ComponentName", () => {
  it("should do something specific", () => {
    // Arrange - Set up test data and mocks
    const mockData = createMockData();
    const mockService = createMockService();

    // Act - Execute the code being tested
    const result = component.doSomething(mockData);

    // Assert - Verify the expected behavior
    expect(result).toBe(expectedValue);
  });
});
```

### Test File Naming

- **Unit Tests**: `ComponentName.test.tsx` or `ComponentName.test.ts`
- **Integration Tests**: `ComponentName.integration.test.tsx`
- **Smoke Tests**: `ComponentName.smoke.test.ts`
- **Edge Cases**: `ComponentName.edge-cases.test.ts`

### Test Organization

```typescript
describe("ComponentName", () => {
  // Setup and teardown
  beforeEach(() => {
    // Common setup
  });

  afterEach(() => {
    // Cleanup
  });

  // Happy path tests
  describe("when data is valid", () => {
    it("should render successfully", () => {
      // Test implementation
    });
  });

  // Error scenarios
  describe("when data is invalid", () => {
    it("should show error message", () => {
      // Test implementation
    });
  });

  // Edge cases
  describe("edge cases", () => {
    it("should handle empty data", () => {
      // Test implementation
    });
  });
});
```

## Component Testing Patterns

### React Component Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const renderComponent = (props = {}) => {
    return render(<ComponentName {...props} />);
  };

  it('should render with default props', () => {
    renderComponent();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state', () => {
    renderComponent({ error: 'Something went wrong' });
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useCustomHook } from "./useCustomHook";

describe("useCustomHook", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it("should fetch data successfully", async () => {
    const { result } = renderHook(() => useCustomHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should handle errors", async () => {
    // Mock service to throw error
    mockService.fetchData.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCustomHook());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

## Service Layer Testing Patterns

### Service Testing

```typescript
import { SmartMenuSettingsHybridService } from "./SmartMenuSettingsHybridService";
import {
  createMockServiceResponse,
  createGraphQLError,
} from "../utils/service-layer-test-utils";

describe("SmartMenuSettingsHybridService", () => {
  let service: SmartMenuSettingsHybridService;

  beforeEach(() => {
    service = new SmartMenuSettingsHybridService();
  });

  afterEach(() => {
    service.clearCache();
  });

  it("should fetch data successfully", async () => {
    const result = await service.getSmartMenuSettings();

    expect(result.smartMenus).toBeDefined();
    expect(result.quarterlyMetrics).toBeDefined();
    expect(result.performanceMetrics).toBeDefined();
  });

  it("should handle API errors gracefully", async () => {
    // Mock API to fail
    mockApiClient.query.mockRejectedValue(
      createGraphQLError("Field not found")
    );

    const result = await service.getSmartMenuSettings();

    // Should still return structure, even with errors
    expect(result.smartMenus).toBeDefined();
    expect(result.quarterlyMetrics).toBeDefined();
  });

  it("should cache results appropriately", async () => {
    const result1 = await service.getSmartMenuSettings();
    const result2 = await service.getSmartMenuSettings();

    expect(result1).toEqual(result2);
    expect(result2.performanceMetrics.cacheHit).toBe(true);
  });
});
```

### API Testing

```typescript
describe("API Endpoints", () => {
  it("should return 200 for valid requests", async () => {
    const response = await request(app)
      .post("/api/endpoint")
      .send({ valid: "data" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });

  it("should return 400 for invalid requests", async () => {
    const response = await request(app)
      .post("/api/endpoint")
      .send({ invalid: "data" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should handle authentication", async () => {
    const response = await request(app)
      .get("/api/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });
});
```

## Mocking Patterns

### Service Mocking

```typescript
// Create reusable mock factories
export const createMockApiClient = (overrides = {}) => ({
  query: vi.fn().mockResolvedValue({ data: {} }),
  mutate: vi.fn().mockResolvedValue({ data: {} }),
  ...overrides,
});

export const createMockCache = (overrides = {}) => ({
  get: vi.fn().mockReturnValue(null),
  set: vi.fn().mockReturnValue(undefined),
  clear: vi.fn().mockReturnValue(undefined),
  ...overrides,
});

// Use in tests
describe("Service", () => {
  beforeEach(() => {
    vi.mock("./api-client", () => ({
      apiClient: createMockApiClient(),
    }));
  });
});
```

### Component Mocking

```typescript
// Mock child components
vi.mock('./ChildComponent', () => ({
  ChildComponent: ({ children, ...props }) => (
    <div data-testid="child-component" {...props}>
      {children}
    </div>
  ),
}));

// Mock hooks
vi.mock('./useCustomHook', () => ({
  useCustomHook: () => ({
    data: mockData,
    loading: false,
    error: null,
  }),
}));
```

## Error Testing Patterns

### GraphQL Error Testing

```typescript
it("should handle GraphQL errors", async () => {
  const graphQLError = createApolloError([
    createGraphQLError("Field not found", ["widgets", "name"]),
  ]);

  mockClient.query.mockRejectedValue(graphQLError);

  await expect(service.fetchData()).rejects.toThrow("Apollo Error");
});
```

### Network Error Testing

```typescript
it("should handle network errors", async () => {
  const networkError = createNetworkError(500, "Internal Server Error");

  mockClient.query.mockRejectedValue(networkError);

  await expect(service.fetchData()).rejects.toThrow("Network Error");
});
```

### Validation Error Testing

```typescript
it("should validate input data", async () => {
  const invalidData = { name: "", email: "invalid-email" };

  await expect(service.createUser(invalidData)).rejects.toThrow(
    ValidationError
  );
});
```

## Performance Testing Patterns

### Timing Tests

```typescript
it("should complete within time limit", async () => {
  const startTime = performance.now();

  await service.getData();

  const endTime = performance.now();
  const duration = endTime - startTime;

  expect(duration).toBeLessThan(5000); // 5 seconds
});
```

### Memory Leak Testing

```typescript
it("should not leak memory", () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // Perform operations that might leak memory
  for (let i = 0; i < 1000; i++) {
    service.doSomething();
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
});
```

## Integration Testing Patterns

### End-to-End Workflows

```typescript
describe('User Registration Flow', () => {
  it('should complete full registration process', async () => {
    // 1. Navigate to registration page
    render(<RegistrationPage />);

    // 2. Fill out form
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    // 3. Verify email confirmation
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });

    // 4. Complete email verification
    // ... continue workflow
  });
});
```

### Service Integration

```typescript
describe("Service Integration", () => {
  it("should work with real dependencies", async () => {
    // Use real services but mock external APIs
    const service = new SmartMenuSettingsHybridService();

    const result = await service.getSmartMenuSettings();

    expect(result).toBeDefined();
    expect(result.smartMenus).toBeInstanceOf(Array);
  });
});
```

## Test Data Patterns

### Factory Functions

```typescript
export const createMockWidget = (overrides = {}) => ({
  id: "test-widget-1",
  name: "Test Widget",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  __typename: "Widget",
  ...overrides,
});

export const createMockQuarterlyMetrics = (overrides = {}) => ({
  quarter: "Q4",
  year: 2024,
  quarterLabel: "Q4 2024",
  orders: { count: 5000, qoqGrowth: 1000, qoqGrowthPercent: 25.0 },
  activeSmartMenus: { count: 25, qoqGrowth: 3, qoqGrowthPercent: 13.6 },
  locations: { count: 1200, qoqGrowth: 200, qoqGrowthPercent: 20.0 },
  ...overrides,
});
```

### Test Data Cleanup

```typescript
describe("Data Management", () => {
  beforeEach(() => {
    // Clear any existing test data
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks();
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - tests implementation details
expect(userService.userRepository.save).toHaveBeenCalled();

// ✅ Good - tests observable behavior
expect(await userService.createUser(userData)).toHaveProperty("id");
```

### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it("should work", () => {});

// ✅ Good
it("should create user with valid email and return user ID", () => {});
```

### 3. Test One Thing at a Time

```typescript
// ❌ Bad - tests multiple behaviors
it("should create user and send email", () => {
  // Tests both user creation and email sending
});

// ✅ Good - separate tests
it("should create user with valid data", () => {
  // Tests only user creation
});

it("should send welcome email after user creation", () => {
  // Tests only email sending
});
```

### 4. Avoid Test Interdependencies

```typescript
// ❌ Bad - tests depend on each other
let userId;

it("should create user", () => {
  userId = userService.createUser(data);
  expect(userId).toBeDefined();
});

it("should update user", () => {
  // Depends on previous test
  userService.updateUser(userId, newData);
});

// ✅ Good - each test is independent
it("should create user", () => {
  const userId = userService.createUser(data);
  expect(userId).toBeDefined();
});

it("should update user", () => {
  const userId = "test-user-id";
  userService.updateUser(userId, newData);
});
```

### 5. Use Appropriate Assertions

```typescript
// ❌ Bad - too specific
expect(result).toEqual({
  id: "123",
  name: "John",
  email: "john@example.com",
  createdAt: "2024-01-01T00:00:00.000Z",
});

// ✅ Good - flexible and focused
expect(result).toMatchObject({
  name: "John",
  email: "john@example.com",
});
expect(result.id).toBeDefined();
expect(result.createdAt).toBeInstanceOf(Date);
```

## Common Anti-Patterns to Avoid

### 1. Testing Implementation Details

```typescript
// ❌ Don't test private methods or internal state
expect(component.state.internalValue).toBe(expectedValue);

// ✅ Test public interface and observable behavior
expect(screen.getByText("Expected Text")).toBeInTheDocument();
```

### 2. Over-Mocking

```typescript
// ❌ Don't mock everything
vi.mock("./utils");
vi.mock("./helpers");
vi.mock("./constants");

// ✅ Mock only external dependencies
vi.mock("./api-client");
vi.mock("./external-service");
```

### 3. Testing Framework Features

```typescript
// ❌ Don't test that React works
expect(component).toBeInstanceOf(React.Component);

// ✅ Test your component's behavior
expect(screen.getByRole("button")).toBeInTheDocument();
```

### 4. Brittle Tests

```typescript
// ❌ Don't rely on specific text or structure
expect(screen.getByText("Exact text here")).toBeInTheDocument();

// ✅ Use semantic queries
expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
```

## Resources

- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

_This document should be updated as we discover new patterns and best practices._
