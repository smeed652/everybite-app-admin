# Testing Strategy

## Overview

Our testing strategy focuses on ensuring code quality, preventing regressions, and maintaining confidence in our codebase through comprehensive testing at multiple levels.

## Testing Philosophy

### Core Principles

1. **Test-Driven Quality**: Write tests to catch issues before they reach production
2. **Real-World Testing**: Use realistic data and scenarios that match actual usage
3. **Regression Prevention**: Tests should catch bugs and prevent them from recurring
4. **Confidence Building**: Tests should give us confidence that our code works correctly

## Bug Fixing Workflow

### Critical Principle: Fix Tests First

**When a bug is found in production but tests are passing, we MUST follow this order:**

1. **First: Fix the tests to catch the issue**
   - Add a test that reproduces the exact bug scenario
   - Use real-world data structures and edge cases
   - Ensure the test fails when the bug is present
   - Document what the test is checking and why

2. **Second: Fix the actual bug**
   - Implement the fix that makes the test pass
   - Verify the fix works in the real application
   - Ensure no regressions are introduced

3. **Third: Validate the complete fix**
   - Run all tests to ensure they still pass
   - Test the fix manually in the application
   - Document the root cause and solution

### Why This Order is Critical

- **Tests are our safety net**: If tests don't catch bugs, they're not doing their job
- **Prevents regressions**: A test that catches the bug will prevent it from happening again
- **Documents issues**: The test serves as documentation of what went wrong
- **Builds confidence**: We know our testing strategy actually works

### Example: URL Parsing Bug

```typescript
// 1. Add test that reproduces the bug
it("catches URL parsing bug with complex URLs", () => {
  const widget = makeWidget({
    orderUrl: "https://example.com/web?id=123#!/?utm_source=test",
  });

  // Simulate buggy URL parsing
  act(() => {
    result.current.handleFieldChange({
      orderUrl: "https://example.com/web?id=123#!/", // Missing UTM params
    });
  });

  // Test should FAIL when bug is present
  expect(result.current.dirty).toBe(true);
  expect(result.current.pendingChanges).toEqual({
    orderUrl: "https://example.com/web?id=123#!/",
  });
});

// 2. Fix the bug in the actual code
// 3. Verify test now passes
// 4. Ensure all other tests still pass
```

### Test Quality Guidelines for Bug Catching

When writing tests to catch bugs:

- **Use realistic data**: Don't use simplified test data that doesn't match real scenarios
- **Test edge cases**: Include complex URLs, nested objects, undefined values, etc.
- **Document the scenario**: Explain what the test is checking and why it's important
- **Make it specific**: Target the exact issue, not just general functionality
- **Keep it maintainable**: Use helper functions and clear test names

## Test Types

### Unit Tests

**Purpose**: Test individual functions and components in isolation

**Coverage**: 90%+ for all components and utilities

**Tools**: Vitest + React Testing Library

**Pattern**: Arrange-Act-Assert

**Example**:

```typescript
it("should format currency correctly", () => {
  // Arrange
  const amount = 1234.56;

  // Act
  const result = formatCurrency(amount);

  // Assert
  expect(result).toBe("$1,234.56");
});
```

### Integration Tests

**Purpose**: Test how components work together and with external dependencies

**Coverage**: All user flows and data interactions

**Tools**: Vitest + MSW for API mocking

**Pattern**: User-centric testing

**Example**:

```typescript
it("should save widget changes and update UI", async () => {
  // Arrange
  render(<WidgetEditor widget={mockWidget} />);

  // Act
  await user.click(screen.getByText("Save"));

  // Assert
  expect(screen.getByText("Changes saved")).toBeInTheDocument();
  expect(mockSaveFunction).toHaveBeenCalledWith(expectedData);
});
```

### End-to-End Tests

**Purpose**: Test complete user workflows from start to finish

**Coverage**: Critical user journeys

**Tools**: Cypress

**Pattern**: Real user scenarios

**Example**:

```typescript
it("should complete widget creation flow", () => {
  cy.visit("/widgets/new");
  cy.get('[data-testid="widget-name"]').type("Test Widget");
  cy.get('[data-testid="save-button"]').click();
  cy.url().should("include", "/widgets/");
  cy.get('[data-testid="success-message"]').should("be.visible");
});
```

## Testing Best Practices

### Test Data Management

- **Use factories**: Create test data factories for consistent, realistic data
- **Avoid magic numbers**: Use named constants for test values
- **Clean up**: Ensure tests don't leave side effects
- **Isolation**: Each test should be independent

### Test Organization

- **Group related tests**: Use describe blocks to organize related tests
- **Clear test names**: Test names should describe the scenario and expected outcome
- **Setup and teardown**: Use beforeEach/afterEach for common setup
- **Test files close to code**: Keep test files near the code they test

### Assertions

- **Be specific**: Test exact values, not just that something exists
- **Test behavior, not implementation**: Focus on what the code does, not how it does it
- **Use meaningful matchers**: Choose the most appropriate assertion for the scenario
- **Test error cases**: Don't just test the happy path

### Mocking

- **Mock external dependencies**: Don't rely on external services in tests
- **Use MSW for API calls**: Mock API responses consistently
- **Mock time**: Use fake timers for time-dependent tests
- **Keep mocks simple**: Don't over-complicate mock implementations

## Test Coverage

### Coverage Targets

- **Unit Tests**: 90%+ line coverage
- **Integration Tests**: All user flows covered
- **E2E Tests**: Critical paths covered

### Coverage Monitoring

- **CI/CD Integration**: Block merges on coverage drops
- **Regular Reviews**: Review coverage reports monthly
- **Gap Analysis**: Identify areas with low coverage
- **Quality over Quantity**: Focus on meaningful tests, not just coverage numbers

## Performance Testing

### Component Performance

- **Render Performance**: Test that components render efficiently
- **Memory Leaks**: Ensure components clean up properly
- **Bundle Size**: Monitor impact on bundle size

### Test Performance

- **Fast Tests**: Keep unit tests under 100ms each
- **Parallel Execution**: Run tests in parallel when possible
- **Selective Testing**: Run only relevant tests during development

## Accessibility Testing

### Automated Testing

- **axe-core**: Run accessibility checks in tests
- **Keyboard Navigation**: Test keyboard-only interactions
- **Screen Reader**: Test with screen reader tools

### Manual Testing

- **Regular Audits**: Conduct accessibility audits quarterly
- **User Testing**: Include users with disabilities in testing
- **WCAG Compliance**: Ensure AA compliance

## Continuous Integration

### Test Automation

- **Pre-commit**: Run unit tests before commits
- **CI Pipeline**: Run all tests on every PR
- **Staging Tests**: Run integration tests in staging environment
- **Production Monitoring**: Monitor for issues in production

### Quality Gates

- **Test Coverage**: Block on coverage drops
- **Test Failures**: Block on any test failures
- **Performance**: Block on performance regressions
- **Accessibility**: Block on accessibility violations

## Documentation

### Test Documentation

- **Test Purpose**: Document why each test exists
- **Test Data**: Document test data setup and assumptions
- **Edge Cases**: Document edge cases and their rationale
- **Maintenance**: Document test maintenance requirements

### Test Examples

- **Common Patterns**: Document common testing patterns
- **Best Practices**: Share testing best practices
- **Troubleshooting**: Document common test issues and solutions

## Review Process

### Test Review Checklist

- [ ] Tests cover the functionality
- [ ] Tests use realistic data
- [ ] Tests are independent and isolated
- [ ] Tests have clear, descriptive names
- [ ] Tests follow established patterns
- [ ] Tests include error cases
- [ ] Tests are maintainable

### Review Guidelines

- **Test Quality**: Focus on test quality, not just quantity
- **Real-world Scenarios**: Ensure tests match real usage
- **Maintainability**: Consider long-term maintenance
- **Documentation**: Ensure tests are well-documented

---

_This testing strategy should be updated as our testing practices evolve and new challenges emerge._
