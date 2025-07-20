# Test Isolation Guidelines

## 🚨 Critical Issue: Test Mocks Interfering with Real Application

**Problem**: Test mocks using `vi.mock()` can persist globally and interfere with the real application, causing features like quarterly metrics to break.

**Example**: The `smartmenu-hybrid.smoke.test.ts` was using global mocks that affected the real Lambda client, causing quarterly metrics to not load in the dashboard.

## 🛡️ Prevention Strategies

### 1. **Prefer Local Mocks Over Global Mocks**

❌ **Avoid Global Mocks**:

```typescript
// DON'T: Global mocks that persist across the entire test suite
vi.mock("../../lib/datawarehouse-lambda-apollo", () => ({
  lambdaClient: mockClient,
}));
```

✅ **Use Local Mocks**:

```typescript
// DO: Local mocks that are isolated to specific tests
describe("My Test", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: vi.fn().mockResolvedValue({ data: {} }),
    };

    // Mock only for this test
    vi.doMock("../../lib/datawarehouse-lambda-apollo", () => ({
      lambdaClient: mockClient,
    }));
  });

  afterEach(() => {
    vi.doUnmock("../../lib/datawarehouse-lambda-apollo");
  });
});
```

### 2. **Use Dependency Injection When Possible**

Instead of mocking modules directly, inject dependencies:

```typescript
// Service with dependency injection
class SmartMenuService {
  constructor(private client: ApolloClient) {}

  async getData() {
    return this.client.query({ query: GET_DATA });
  }
}

// Test with injected mock
const mockClient = { query: vi.fn() };
const service = new SmartMenuService(mockClient);
```

### 3. **Isolate Critical Infrastructure**

For critical infrastructure like Lambda clients, use isolated test environments:

```typescript
// Create separate test utilities
// src/__tests__/utils/test-clients.ts
export const createMockLambdaClient = () => ({
  query: vi.fn().mockResolvedValue({ data: {} }),
});

// Use in tests
import { createMockLambdaClient } from "../utils/test-clients";
const mockClient = createMockLambdaClient();
```

### 4. **Test Environment Validation**

Add validation to ensure tests don't interfere with real application:

```typescript
// Add to critical service files
if (process.env.NODE_ENV === "test") {
  console.warn("Running in test environment - some features may be mocked");
}

// Add to test setup
beforeEach(() => {
  // Verify we're in test environment
  expect(process.env.NODE_ENV).toBe("test");
});
```

## 🔍 Detection Strategies

### 1. **Pre-commit Validation**

Add a pre-commit hook that:

- Runs tests in isolation
- Verifies the real application still works
- Checks for any global mocks

### 2. **Integration Test Validation**

Create integration tests that verify the real application works:

```typescript
// src/__tests__/integration/app-functionality.test.ts
describe("Real Application Integration", () => {
  it("should load quarterly metrics without mocks", async () => {
    // This test runs without any mocks to verify real functionality
    const service = new SmartMenuSettingsHybridService();
    const result = await service.getSmartMenuSettings();

    expect(result.quarterlyMetrics).toBeDefined();
    expect(Array.isArray(result.quarterlyMetrics)).toBe(true);
  });
});
```

### 3. **Mock Detection**

Add utilities to detect when mocks are being used:

```typescript
// src/__tests__/utils/mock-detector.ts
export const detectGlobalMocks = () => {
  const modules = Object.keys(require.cache);
  const mockedModules = modules.filter(
    (module) =>
      module.includes("datawarehouse-lambda-apollo") ||
      module.includes("api-graphql-apollo")
  );

  if (mockedModules.length > 0) {
    console.warn("Global mocks detected:", mockedModules);
  }
};
```

## 📋 Checklist for New Tests

Before adding new tests, verify:

- [ ] **No global mocks** - Use local mocks or dependency injection
- [ ] **Proper cleanup** - All mocks are restored after tests
- [ ] **Isolation** - Tests don't affect other tests or the real application
- [ ] **Validation** - Real application functionality is verified
- [ ] **Documentation** - Test approach is documented

## 🚨 Emergency Procedures

If tests are interfering with the real application:

1. **Immediate Fix**: Disable problematic tests using `describe.skip()`
2. **Investigation**: Identify which mocks are causing interference
3. **Refactoring**: Convert global mocks to local mocks
4. **Validation**: Verify real application works after changes
5. **Documentation**: Update guidelines to prevent recurrence

## 📚 Best Practices

### **For Service Tests**:

- Mock at the service level, not the client level
- Use dependency injection
- Test the service interface, not implementation details

### **For Component Tests**:

- Mock hooks and services, not underlying clients
- Use `@testing-library/react` patterns
- Test user interactions, not internal state

### **For Integration Tests**:

- Use real clients with test data
- Mock external APIs, not internal services
- Verify end-to-end functionality

## 🔧 Tools and Utilities

### **Mock Utilities**:

```typescript
// src/__tests__/utils/mock-utils.ts
export const createIsolatedMock = (
  modulePath: string,
  mockImplementation: any
) => {
  const originalModule = require(modulePath);

  beforeEach(() => {
    vi.doMock(modulePath, () => mockImplementation);
  });

  afterEach(() => {
    vi.doUnmock(modulePath);
  });

  return originalModule;
};
```

### **Test Environment Setup**:

```typescript
// src/__tests__/setup/test-environment.ts
export const setupTestEnvironment = () => {
  // Ensure we're in test environment
  process.env.NODE_ENV = "test";

  // Clear any existing mocks
  vi.clearAllMocks();

  // Setup test-specific configurations
  vi.stubEnv("VITE_API_KEY", "test-api-key");
};
```

## 📈 Monitoring

### **Test Impact Metrics**:

- Track test execution time
- Monitor for global mock usage
- Alert on test interference with real functionality

### **Continuous Validation**:

- Run integration tests after unit tests
- Verify real application functionality in CI/CD
- Monitor for test-related production issues

---

**Remember**: The goal is to have tests that validate functionality without interfering with the real application. When in doubt, prefer local mocks and dependency injection over global mocks.
