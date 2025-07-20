# Test Troubleshooting Guide

## Common Test Issues and Solutions

This guide covers common testing issues encountered in the EveryBite Admin Application and their solutions.

## Table of Contents

1. [Test Setup Issues](#test-setup-issues)
2. [Mocking Problems](#mocking-problems)
3. [Async/Await Issues](#asyncawait-issues)
4. [Component Testing Issues](#component-testing-issues)
5. [Service Testing Issues](#service-testing-issues)
6. [Performance Issues](#performance-issues)
7. [Flaky Tests](#flaky-tests)
8. [Coverage Issues](#coverage-issues)
9. [Environment Issues](#environment-issues)
10. [Debugging Techniques](#debugging-techniques)

## Test Setup Issues

### Issue: Tests not running or failing to start

**Symptoms:**

- `vitest` command fails
- Tests don't execute
- Import errors

**Solutions:**

1. **Check Node.js version:**

   ```bash
   node --version
   # Should be 18+ for this project
   ```

2. **Clear node_modules and reinstall:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Vitest configuration:**

   ```bash
   # Verify vitest.config.ts exists and is valid
   npx vitest --config vitest.config.ts --run
   ```

4. **Check TypeScript configuration:**
   ```bash
   # Verify tsconfig.json is valid
   npx tsc --noEmit
   ```

### Issue: Import/Module resolution errors

**Symptoms:**

- `Cannot resolve module` errors
- Path resolution issues
- TypeScript import errors

**Solutions:**

1. **Check path aliases in tsconfig.json:**

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@/components/*": ["src/components/*"]
       }
     }
   }
   ```

2. **Update Vitest configuration for path resolution:**

   ```typescript
   // vitest.config.ts
   import { defineConfig } from "vitest/config";
   import path from "path";

   export default defineConfig({
     test: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
         "@/components": path.resolve(__dirname, "./src/components"),
       },
     },
   });
   ```

3. **Check file extensions:**
   ```typescript
   // Use explicit extensions for test files
   import { Component } from "./Component.tsx";
   ```

## Mocking Problems

### Issue: Mocks not working as expected

**Symptoms:**

- Mocks not being called
- Real implementations still running
- Mock return values not respected

**Solutions:**

1. **Ensure mocks are hoisted:**

   ```typescript
   // Place mocks at the top of the file
   vi.mock("./api-client", () => ({
     apiClient: {
       query: vi.fn(),
       mutate: vi.fn(),
     },
   }));
   ```

2. **Use vi.mocked for better typing:**

   ```typescript
   import { vi } from "vitest";
   import { apiClient } from "./api-client";

   vi.mock("./api-client");
   const mockedApiClient = vi.mocked(apiClient);
   ```

3. **Clear mocks between tests:**

   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });

   afterEach(() => {
     vi.resetAllMocks();
   });
   ```

4. **Mock implementation:**

   ```typescript
   // Mock with specific implementation
   vi.mocked(apiClient.query).mockResolvedValue({
     data: { widgets: [] },
   });

   // Mock with different responses
   vi.mocked(apiClient.query)
     .mockResolvedValueOnce({ data: { widgets: [widget1] } })
     .mockResolvedValueOnce({ data: { widgets: [widget2] } });
   ```

### Issue: Module mocking not working

**Symptoms:**

- Real modules still being imported
- Mock not taking effect

**Solutions:**

1. **Use vi.doMock for dynamic mocking:**

   ```typescript
   beforeEach(async () => {
     vi.doMock("./service", () => ({
       default: {
         getData: vi.fn().mockResolvedValue([]),
       },
     }));
   });
   ```

2. **Mock with factory function:**

   ```typescript
   vi.mock("./service", () => {
     return {
       default: {
         getData: vi.fn(),
       },
     };
   });
   ```

3. **Check mock placement:**

   ```typescript
   // Mocks must be at the top level, before imports
   vi.mock("./service");

   import { Service } from "./service"; // Import after mock
   ```

## Async/Await Issues

### Issue: Tests timing out

**Symptoms:**

- Tests fail with timeout errors
- Async operations not completing
- Promises not resolving

**Solutions:**

1. **Use proper async/await:**

   ```typescript
   it("should handle async operations", async () => {
     const result = await service.getData();
     expect(result).toBeDefined();
   });
   ```

2. **Use waitFor for async UI updates:**

   ```typescript
   import { waitFor } from '@testing-library/react';

   it('should update UI after async operation', async () => {
     render(<Component />);

     await waitFor(() => {
       expect(screen.getByText('Loaded')).toBeInTheDocument();
     });
   });
   ```

3. **Increase timeout for slow operations:**

   ```typescript
   it("should complete slow operation", async () => {
     const result = await service.slowOperation();
     expect(result).toBeDefined();
   }, 10000); // 10 second timeout
   ```

4. **Use Promise.all for concurrent operations:**
   ```typescript
   it("should handle concurrent requests", async () => {
     const promises = [
       service.getData(1),
       service.getData(2),
       service.getData(3),
     ];

     const results = await Promise.all(promises);
     expect(results).toHaveLength(3);
   });
   ```

### Issue: Async operations not being awaited

**Symptoms:**

- Tests pass but operations not completed
- Race conditions
- Inconsistent test results

**Solutions:**

1. **Always await async operations:**

   ```typescript
   // ❌ Bad
   it("should update data", () => {
     service.updateData(data);
     expect(screen.getByText("Updated")).toBeInTheDocument();
   });

   // ✅ Good
   it("should update data", async () => {
     await service.updateData(data);
     expect(screen.getByText("Updated")).toBeInTheDocument();
   });
   ```

2. **Use waitFor for UI updates:**
   ```typescript
   it('should show loading state', async () => {
     render(<Component />);

     await waitFor(() => {
       expect(screen.getByRole('status')).toBeInTheDocument();
     });
   });
   ```

## Component Testing Issues

### Issue: Component not rendering

**Symptoms:**

- Component renders as null
- Empty DOM
- Missing elements

**Solutions:**

1. **Check component props:**

   ```typescript
   it('should render with required props', () => {
     render(<Component requiredProp="value" />);
     expect(screen.getByText('Component')).toBeInTheDocument();
   });
   ```

2. **Check for errors in component:**

   ```typescript
   it('should handle component errors', () => {
     // Mock console.error to catch errors
     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

     render(<Component />);

     expect(consoleSpy).not.toHaveBeenCalled();
     consoleSpy.mockRestore();
   });
   ```

3. **Check for conditional rendering:**

   ```typescript
   it('should render when condition is met', () => {
     render(<Component shouldRender={true} />);
     expect(screen.getByText('Content')).toBeInTheDocument();
   });

   it('should not render when condition is not met', () => {
     render(<Component shouldRender={false} />);
     expect(screen.queryByText('Content')).not.toBeInTheDocument();
   });
   ```

### Issue: User interactions not working

**Symptoms:**

- Clicks not registering
- Form submissions not working
- Input changes not detected

**Solutions:**

1. **Use userEvent properly:**

   ```typescript
   import userEvent from '@testing-library/user-event';

   it('should handle user interactions', async () => {
     const user = userEvent.setup();
     render(<Component />);

     await user.click(screen.getByRole('button'));
     expect(mockOnClick).toHaveBeenCalled();
   });
   ```

2. **Wait for async interactions:**

   ```typescript
   it('should handle form submission', async () => {
     const user = userEvent.setup();
     render(<Component />);

     await user.type(screen.getByLabelText('Name'), 'Test');
     await user.click(screen.getByRole('button', { name: /submit/i }));

     await waitFor(() => {
       expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'Test' });
     });
   });
   ```

3. **Check element accessibility:**
   ```typescript
   it('should have accessible elements', () => {
     render(<Component />);

     // Use semantic queries
     expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
     expect(screen.getByLabelText('Name')).toBeInTheDocument();
   });
   ```

## Service Testing Issues

### Issue: Service methods not being called

**Symptoms:**

- Mock not being called
- Real service being used
- Unexpected behavior

**Solutions:**

1. **Mock the service properly:**

   ```typescript
   vi.mock("./service", () => ({
     Service: vi.fn().mockImplementation(() => ({
       getData: vi.fn().mockResolvedValue([]),
       updateData: vi.fn().mockResolvedValue({}),
     })),
   }));
   ```

2. **Check service instantiation:**

   ```typescript
   it("should call service method", async () => {
     const mockService = new Service();
     vi.mocked(mockService.getData).mockResolvedValue([]);

     const result = await mockService.getData();
     expect(mockService.getData).toHaveBeenCalled();
   });
   ```

3. **Use dependency injection:**
   ```typescript
   it("should use injected service", async () => {
     const mockService = {
       getData: vi.fn().mockResolvedValue([]),
     };

     const component = new Component(mockService);
     await component.loadData();

     expect(mockService.getData).toHaveBeenCalled();
   });
   ```

### Issue: GraphQL errors not being handled

**Symptoms:**

- GraphQL errors not caught
- Tests failing unexpectedly
- Error states not tested

**Solutions:**

1. **Mock GraphQL errors:**

   ```typescript
   it("should handle GraphQL errors", async () => {
     const graphQLError = createApolloError([
       createGraphQLError("Field not found", ["widgets", "name"]),
     ]);

     vi.mocked(apiClient.query).mockRejectedValue(graphQLError);

     await expect(service.getData()).rejects.toThrow("Apollo Error");
   });
   ```

2. **Test error states:**
   ```typescript
   it('should show error state', async () => {
     vi.mocked(apiClient.query).mockRejectedValue(new Error('Network error'));

     render(<Component />);

     await waitFor(() => {
       expect(screen.getByText('Error loading data')).toBeInTheDocument();
     });
   });
   ```

## Performance Issues

### Issue: Tests running slowly

**Symptoms:**

- Tests taking too long
- Timeout errors
- Slow CI builds

**Solutions:**

1. **Optimize test setup:**

   ```typescript
   // Use beforeAll for expensive setup
   beforeAll(async () => {
     await setupTestDatabase();
   });

   // Use beforeEach for per-test setup
   beforeEach(() => {
     clearTestData();
   });
   ```

2. **Mock expensive operations:**

   ```typescript
   // Mock API calls instead of real network requests
   vi.mock("./api-client", () => ({
     apiClient: {
       query: vi.fn().mockResolvedValue({ data: {} }),
     },
   }));
   ```

3. **Use test isolation:**

   ```typescript
   // Each test should be independent
   afterEach(() => {
     vi.clearAllMocks();
     cleanup();
   });
   ```

4. **Run tests in parallel:**
   ```bash
   # Use Vitest's built-in parallelization
   npx vitest --threads
   ```

### Issue: Memory leaks in tests

**Symptoms:**

- Tests consuming too much memory
- Out of memory errors
- Slow test execution

**Solutions:**

1. **Clean up after tests:**

   ```typescript
   afterEach(() => {
     vi.clearAllMocks();
     cleanup(); // Clean up React components
   });

   afterAll(() => {
     // Clean up global state
     localStorage.clear();
     sessionStorage.clear();
   });
   ```

2. **Avoid global state:**

   ```typescript
   // ❌ Bad - global state
   let globalData = [];

   // ✅ Good - local state
   it("should handle data", () => {
     const localData = [];
     // Test with local data
   });
   ```

## Flaky Tests

### Issue: Tests failing intermittently

**Symptoms:**

- Tests pass sometimes, fail others
- Race conditions
- Timing issues

**Solutions:**

1. **Use deterministic test data:**

   ```typescript
   // Use fixed test data
   const testData = [
     { id: "1", name: "Test 1" },
     { id: "2", name: "Test 2" },
   ];
   ```

2. **Wait for async operations:**

   ```typescript
   it('should handle async state updates', async () => {
     render(<Component />);

     await waitFor(() => {
       expect(screen.getByText('Loaded')).toBeInTheDocument();
     }, { timeout: 5000 });
   });
   ```

3. **Use retry logic for flaky tests:**

   ```typescript
   it('should eventually load data', async () => {
     render(<Component />);

     await waitFor(() => {
       expect(screen.getByText('Loaded')).toBeInTheDocument();
     }, {
       timeout: 10000,
       interval: 100,
     });
   });
   ```

4. **Isolate test environment:**
   ```typescript
   beforeEach(() => {
     // Reset to known state
     vi.clearAllMocks();
     cleanup();
   });
   ```

## Coverage Issues

### Issue: Low test coverage

**Symptoms:**

- Coverage below thresholds
- Untested code paths
- Missing edge cases

**Solutions:**

1. **Add tests for uncovered code:**

   ```bash
   # Generate coverage report
   npm run test:coverage

   # Review uncovered lines and add tests
   ```

2. **Test error paths:**

   ```typescript
   it("should handle error case", async () => {
     vi.mocked(service.getData).mockRejectedValue(new Error("Error"));

     await expect(component.loadData()).rejects.toThrow("Error");
   });
   ```

3. **Test edge cases:**

   ```typescript
   it('should handle empty data', () => {
     render(<Component data={[]} />);
     expect(screen.getByText('No data')).toBeInTheDocument();
   });

   it('should handle null data', () => {
     render(<Component data={null} />);
     expect(screen.getByText('Loading')).toBeInTheDocument();
   });
   ```

### Issue: Coverage not accurate

**Symptoms:**

- Coverage report doesn't match reality
- Missing coverage for executed code
- False positives

**Solutions:**

1. **Check coverage configuration:**

   ```typescript
   // vitest.config.ts
   export default defineConfig({
     test: {
       coverage: {
         provider: "v8",
         reporter: ["text", "json", "html"],
         exclude: ["node_modules/", "src/**/*.d.ts", "src/**/*.stories.tsx"],
       },
     },
   });
   ```

2. **Use source maps:**
   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "sourceMap": true,
     }
   }
   ```

## Environment Issues

### Issue: Environment variables not available

**Symptoms:**

- Tests failing due to missing env vars
- Different behavior in test vs dev
- Configuration issues

**Solutions:**

1. **Set up test environment:**

   ```typescript
   // vitest.config.ts
   export default defineConfig({
     test: {
       env: {
         NODE_ENV: "test",
         API_URL: "http://localhost:3000",
       },
     },
   });
   ```

2. **Use .env.test file:**

   ```bash
   # .env.test
   API_URL=http://localhost:3000
   DATABASE_URL=test-db-url
   ```

3. **Mock environment in tests:**

   ```typescript
   beforeEach(() => {
     process.env.API_URL = "http://localhost:3000";
   });

   afterEach(() => {
     delete process.env.API_URL;
   });
   ```

### Issue: Different behavior in CI vs local

**Symptoms:**

- Tests pass locally but fail in CI
- Different timing in CI
- Environment differences

**Solutions:**

1. **Use consistent environment:**

   ```yaml
   # .github/workflows/test.yml
   - name: Run tests
     env:
       NODE_ENV: test
       CI: true
     run: npm run test
   ```

2. **Add CI-specific configuration:**
   ```typescript
   // vitest.config.ts
   export default defineConfig({
     test: {
       timeout: process.env.CI ? 10000 : 5000,
     },
   });
   ```

## Debugging Techniques

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

### Network Debugging

```typescript
it("should debug API calls", () => {
  // Log all API calls
  vi.mocked(apiClient.query).mockImplementation((query) => {
    console.log("API Query:", query);
    return Promise.resolve({ data: {} });
  });
});
```

## Common Error Messages

### "Cannot read property 'querySelector' of null"

**Cause:** Component not rendering properly
**Solution:** Check component props and error boundaries

### "TypeError: Cannot read property 'mockResolvedValue' of undefined"

**Cause:** Mock not set up properly
**Solution:** Ensure mock is defined before use

### "Timeout - Async callback was not invoked within the 5000ms timeout"

**Cause:** Async operation not completing
**Solution:** Increase timeout or fix async logic

### "Expected element to be in the document"

**Cause:** Element not found in DOM
**Solution:** Check element selectors and component rendering

## Getting Help

1. **Check existing documentation:**
   - [Testing Patterns](./TESTING-PATTERNS.md)
   - [Test Templates](./templates/test-templates.md)

2. **Review similar tests:**
   - Look at existing test files for patterns
   - Check component/service implementations

3. **Use debugging tools:**
   - Console logging
   - Screen debugging
   - Breakpoint debugging

4. **Ask for help:**
   - Document the issue clearly
   - Include error messages and stack traces
   - Provide minimal reproduction case

---

_This guide should be updated as new issues are discovered and resolved._
