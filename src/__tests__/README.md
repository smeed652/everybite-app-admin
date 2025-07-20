# Testing Guide

## Overview

This directory contains all tests for the EveryBite Admin Application. We use **Vitest** as our testing framework with **React Testing Library** for component testing and **MSW** for API mocking.

## Test Structure

```
src/__tests__/
├── api/                    # API and service layer tests
│   ├── lambda-graphql.smoke.test.ts
│   ├── smartmenu-hybrid.smoke.test.ts
│   └── smartmenu-hybrid-edge-cases.test.ts
├── integration/            # Integration tests
│   ├── auth-routing.test.tsx
│   └── smartmenu-detail-flow.test.tsx
├── utils/                  # Test utilities and helpers
│   └── service-layer-test-utils.ts
├── factories/              # Test data factories
│   └── widget.ts
└── README.md              # This file
```

## Test Categories

### 1. **Unit Tests** (`*.test.ts` / `*.test.tsx`)

- Test individual functions, components, or services in isolation
- Use mocks for external dependencies
- Fast execution, focused scope

### 2. **Integration Tests** (`*.integration.test.tsx`)

- Test interactions between multiple components/services
- May use real dependencies where appropriate
- Test complete workflows

### 3. **Smoke Tests** (`*.smoke.test.ts`)

- Quick tests to verify basic functionality
- Minimal assertions, fast execution
- Used in CI/CD pipelines

### 4. **Edge Case Tests** (`*.edge-cases.test.ts`)

- Test error scenarios, boundary conditions
- Validate error handling and edge cases
- Ensure robustness

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ComponentName.test.tsx

# Run tests matching pattern
npm test -- --grep "should render"

# Run tests in specific directory
npm test src/__tests__/api/
```

### Test Scripts

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Smoke tests only
npm run test:smoke

# Tests with verbose output
npm run test:verbose

# Tests with debug output
npm run test:debug
```

## Writing Tests

### Component Testing

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

  it('should render with default props', () => {
    renderComponent();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    renderComponent({ onClick: mockOnClick });

    await user.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

### Service Testing

```typescript
import { ServiceName } from "./ServiceName";
import { createMockServiceResponse } from "./utils/service-layer-test-utils";

describe("ServiceName", () => {
  let service: ServiceName;

  beforeEach(() => {
    service = new ServiceName();
  });

  afterEach(() => {
    service.clearCache();
    vi.clearAllMocks();
  });

  it("should fetch data successfully", async () => {
    const result = await service.getData();

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should handle errors gracefully", async () => {
    // Mock API to fail
    mockApiClient.query.mockRejectedValue(new Error("Network error"));

    const result = await service.getData();

    // Should still return structure, even with errors
    expect(result.smartMenus).toBeDefined();
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
});
```

## Test Utilities

### Service Layer Test Utils

Located in `src/__tests__/utils/service-layer-test-utils.ts`, this file provides:

- **Mock factories** for common test data
- **Error creation utilities** for GraphQL and network errors
- **Performance testing helpers**
- **Retry logic utilities**
- **Validation helpers**

```typescript
import {
  createMockWidget,
  createGraphQLError,
  createNetworkError,
  measurePerformance,
  retryWithBackoff,
} from "./utils/service-layer-test-utils";

// Use in tests
const mockWidget = createMockWidget({ name: "Test Widget" });
const graphQLError = createGraphQLError("Field not found", ["widgets", "name"]);
```

### Test Data Factories

Located in `src/__tests__/factories/`, these provide reusable test data:

```typescript
import { createWidget } from "./factories/widget";

// Create test data with defaults
const widget = createWidget();

// Override specific properties
const customWidget = createWidget({
  name: "Custom Widget",
  isActive: false,
});
```

## Mocking Strategies

### API Mocking

```typescript
// Mock API client
vi.mock("./api-client", () => ({
  apiClient: {
    query: vi.fn().mockResolvedValue({ data: {} }),
    mutate: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

// Use in tests
const mockedApiClient = vi.mocked(apiClient);
mockedApiClient.query.mockResolvedValue({
  data: { widgets: [mockWidget] },
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

### Service Mocking

```typescript
// Mock service class
vi.mock("./Service", () => ({
  Service: vi.fn().mockImplementation(() => ({
    getData: vi.fn().mockResolvedValue([]),
    updateData: vi.fn().mockResolvedValue({}),
  })),
}));
```

## Best Practices

### 1. **AAA Pattern (Arrange, Act, Assert)**

```typescript
it("should create user with valid data", () => {
  // Arrange - Set up test data and mocks
  const userData = { name: "John", email: "john@example.com" };
  const mockRepo = createMockUserRepository();

  // Act - Execute the code being tested
  const result = userService.createUser(userData, mockRepo);

  // Assert - Verify the expected behavior
  expect(result.success).toBe(true);
  expect(mockRepo.save).toHaveBeenCalledWith(userData);
});
```

### 2. **Test Behavior, Not Implementation**

```typescript
// ❌ Bad - tests implementation details
expect(userService.userRepository.save).toHaveBeenCalled();

// ✅ Good - tests observable behavior
expect(await userService.createUser(userData)).toHaveProperty("id");
```

### 3. **Use Descriptive Test Names**

```typescript
// ❌ Bad
it("should work", () => {});

// ✅ Good
it("should create user with valid email and return user ID", () => {});
```

### 4. **Test One Thing at a Time**

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

### 5. **Keep Tests Independent**

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

## Error Testing

### GraphQL Errors

```typescript
it("should handle GraphQL errors", async () => {
  const graphQLError = createApolloError([
    createGraphQLError("Field not found", ["widgets", "name"]),
  ]);

  mockClient.query.mockRejectedValue(graphQLError);

  await expect(service.fetchData()).rejects.toThrow("Apollo Error");
});
```

### Network Errors

```typescript
it("should handle network errors", async () => {
  const networkError = createNetworkError(500, "Internal Server Error");

  mockClient.query.mockRejectedValue(networkError);

  await expect(service.fetchData()).rejects.toThrow("Network Error");
});
```

### Validation Errors

```typescript
it("should validate input data", async () => {
  const invalidData = { name: "", email: "invalid-email" };

  await expect(service.createUser(invalidData)).rejects.toThrow(
    ValidationError
  );
});
```

## Performance Testing

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

## Coverage

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.stories.tsx",
        "src/**/*.config.ts",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage:html

# Check coverage thresholds
npm run test:coverage:check
```

## Debugging Tests

### Console Debugging

```typescript
it('should debug test', () => {
  console.log('Test data:', testData);
  console.log('Component props:', props);

  render(<Component {...props} />);

  // Use screen.debug() to see DOM
  screen.debug();
});
```

### Debug Mode

```bash
# Run tests in debug mode
npx vitest --reporter=verbose

# Run specific test with debug
npx vitest --reporter=verbose Component.test.tsx
```

### Breakpoint Debugging

```typescript
it('should debug with breakpoint', () => {
  debugger; // Set breakpoint here
  render(<Component />);
  // Continue debugging
});
```

## Common Issues and Solutions

### Tests Timing Out

```typescript
// Increase timeout for slow operations
it("should complete slow operation", async () => {
  const result = await service.slowOperation();
  expect(result).toBeDefined();
}, 10000); // 10 second timeout
```

### Async Operations Not Being Awaited

```typescript
// Always await async operations
it("should update data", async () => {
  await service.updateData(data);
  expect(screen.getByText("Updated")).toBeInTheDocument();
});
```

### Mocks Not Working

```typescript
// Ensure mocks are hoisted
vi.mock("./api-client", () => ({
  apiClient: {
    query: vi.fn(),
  },
}));

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Resources

- [Testing Patterns](./TESTING-PATTERNS.md) - Comprehensive testing patterns
- [Test Templates](./templates/test-templates.md) - Reusable test templates
- [Test Troubleshooting](./TEST-TROUBLESHOOTING.md) - Common issues and solutions
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)

---

_This README should be updated as testing patterns evolve._
