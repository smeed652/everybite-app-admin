# Test Suite Documentation

This directory contains comprehensive tests for the EveryBite Admin App, covering unit tests, integration tests, and end-to-end tests.

## Test Structure

```
src/__tests__/
├── README.md                    # This documentation
├── test-utils.tsx              # Common test utilities and helpers
├── run-tests.sh                # Test runner script
├── MetabaseUsersTable.test.tsx # Component tests for MetabaseUsersTable
├── useMetabase.test.ts         # Hook tests for useMetabase
├── Dashboard.test.tsx          # Component tests for Dashboard
├── MetabaseUsersPage.test.tsx  # Page tests for MetabaseUsers
├── metabase-integration.test.tsx # Integration tests
└── [existing test files...]
```

## Testing Strategy

### 1. Unit Tests

- **Components**: Test individual React components in isolation
- **Hooks**: Test custom hooks with proper mocking
- **Utilities**: Test helper functions and utilities
- **Coverage**: Aim for >90% code coverage

### 2. Integration Tests

- **Component Integration**: Test how components work together
- **API Integration**: Test GraphQL and REST API interactions
- **Routing**: Test navigation and routing behavior
- **Authentication**: Test role-based access control

### 3. End-to-End Tests

- **User Flows**: Test complete user journeys
- **Cross-browser**: Test in multiple browsers
- **Performance**: Test loading times and responsiveness

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test MetabaseUsersTable.test.tsx

# Run tests with coverage
npm run test:coverage
```

### Using the Test Runner Script

```bash
# Make script executable (first time only)
chmod +x src/__tests__/run-tests.sh

# Run comprehensive test suite
./src/__tests__/run-tests.sh
```

### Individual Test Commands

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## Test Categories

### Component Tests (`*.test.tsx`)

#### MetabaseUsersTable.test.tsx

Tests the Metabase users table component:

- ✅ Rendering with different data states
- ✅ Loading states and error handling
- ✅ User interaction (search, sort, filter)
- ✅ Badge display for user status and roles
- ✅ Date formatting and null handling
- ✅ Refresh functionality

#### Dashboard.test.tsx

Tests the main dashboard component:

- ✅ Metrics calculation and display
- ✅ Trending delta calculations
- ✅ GraphQL data integration
- ✅ Error state handling
- ✅ Loading states

#### MetabaseUsersPage.test.tsx

Tests the Metabase users page:

- ✅ Page layout and structure
- ✅ Component integration
- ✅ Navigation state

### Hook Tests (`*.test.ts`)

#### useMetabase.test.ts

Tests the Metabase API hook:

- ✅ API calls and data fetching
- ✅ Error handling and retry logic
- ✅ Loading state management
- ✅ Data transformation
- ✅ Network error scenarios

### Integration Tests (`*-integration.test.tsx`)

#### metabase-integration.test.tsx

Tests end-to-end Metabase functionality:

- ✅ Navigation between pages
- ✅ Authentication and authorization
- ✅ Data flow between components
- ✅ URL state management
- ✅ Error boundaries

## Test Utilities

### test-utils.tsx

Common utilities for all tests:

- `customRender()`: Enhanced render function with providers
- `mockMetabaseUsers`: Mock user data
- `mockWidgets`: Mock widget data
- `createMockFetchResponse()`: Mock fetch responses
- `createGraphQLMock()`: Create GraphQL mocks
- `mockAuth`: Authentication mocks
- `waitForLoadingToFinish()`: Wait for loading states

### Mock Data

```typescript
// Example usage
import { mockMetabaseUsers, customRender } from './test-utils';

test('renders users table', () => {
  customRender(<MetabaseUsersTable />, {
    mocks: [createGraphQLMock(GET_USERS, mockMetabaseUsers)]
  });
});
```

## Testing Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Mocking Strategy

- Mock external dependencies (APIs, libraries)
- Use realistic mock data
- Test error scenarios with mocks

### 3. Component Testing

- Test user interactions (clicks, form inputs)
- Test loading and error states
- Test accessibility features

### 4. Hook Testing

- Test all hook states (loading, success, error)
- Test hook dependencies and cleanup
- Test custom hook logic

### 5. Integration Testing

- Test component interactions
- Test data flow between components
- Test routing and navigation

## Coverage Goals

| Category    | Target Coverage |
| ----------- | --------------- |
| Components  | >95%            |
| Hooks       | >90%            |
| Utilities   | >95%            |
| Integration | >85%            |
| Overall     | >90%            |

## Debugging Tests

### Common Issues

1. **Async Tests**: Use `waitFor()` for async operations
2. **Mocking**: Ensure mocks are properly set up
3. **Timing**: Add delays for loading states
4. **Environment**: Check test environment variables

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test with debug
npm test -- --run --reporter=verbose MetabaseUsersTable.test.tsx

# Debug failing tests
npm test -- --run --reporter=verbose --bail
```

## Continuous Integration

Tests are automatically run in CI/CD pipeline:

- Unit tests on every commit
- Integration tests on pull requests
- E2E tests on deployment
- Coverage reports generated automatically

## Adding New Tests

### For New Components

1. Create `ComponentName.test.tsx`
2. Import test utilities
3. Test rendering, interactions, and edge cases
4. Add to test suite

### For New Hooks

1. Create `useHookName.test.ts`
2. Test all hook states
3. Test error scenarios
4. Test cleanup and dependencies

### For New Pages

1. Create `PageName.test.tsx`
2. Test routing and layout
3. Test component integration
4. Test user flows

## Test Environment

### Environment Variables

```bash
NODE_ENV=test
VITE_METABASE_API_URL=https://api.metabase.test
VITE_GRAPHQL_URI=https://api.everybite.com/graphql
VITE_LOG_LEVEL=debug
```

### Dependencies

- `@testing-library/react`: React component testing
- `@testing-library/jest-dom`: Custom matchers
- `vitest`: Test runner
- `@apollo/client/testing`: GraphQL testing
- `react-router-dom`: Router testing

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation

## Resources

- [Testing Library Documentation](https://testing-library.com/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Best Practices](https://react.dev/learn/testing)
- [GraphQL Testing Guide](https://www.apollographql.com/docs/react/development-testing/testing/)
