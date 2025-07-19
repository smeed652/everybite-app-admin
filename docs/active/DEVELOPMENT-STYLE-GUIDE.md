# Development Style Guide

## Overview

This document establishes our development approach, patterns, and quality standards to ensure consistent, efficient, and maintainable code development.

## Development Philosophy

### Core Principles

1. **Move Fast, Then Polish** - Get working functionality first, then add quality engineering
2. **Test-Driven Quality** - Build tests after functionality is stable
3. **Atomic Design** - Use systematic component architecture
4. **Iterative Refinement** - Improve through cycles of feedback and iteration

## Development Workflow

### Phase 1: Rapid Prototyping & Design

**Goal**: Get working functionality and user experience

- **Focus**: Features, pages, user flows
- **Approach**:
  - Build rough implementations quickly
  - Focus on functionality over perfection
  - Get user feedback early
  - Iterate on design and UX
- **Deliverable**: Working prototype with core functionality

### Phase 2: Unit Test Foundation

**Goal**: Ensure individual components work correctly

- **Focus**: Component-level testing
- **Approach**:
  - Write comprehensive unit tests for all components
  - Test edge cases and error states
  - Ensure 90%+ test coverage
- **Deliverable**: Stable, well-tested components

### Phase 3: Integration Testing

**Goal**: Ensure components work together correctly

- **Focus**: User flows and data interactions
- **Approach**:
  - Test complete user journeys
  - Validate API integrations
  - Test error handling and edge cases
- **Deliverable**: Robust, integrated functionality

### Phase 4: Storybook & Documentation (Optional)

**Goal**: Document and showcase components

- **Focus**: Core components using atomic design
- **Approach**:
  - Only for widely-used components
  - Focus on atoms, molecules, and select organisms
  - Case-by-case decision for each component
- **Deliverable**: Component library and documentation

## Component Architecture

### Atomic Design Principles

#### Atoms

- **Definition**: Basic building blocks (buttons, inputs, icons)
- **Storybook**: Always document
- **Testing**: Comprehensive unit tests
- **Examples**: Button, Input, Badge, Icon

#### Molecules

- **Definition**: Simple combinations of atoms (form fields, search bars)
- **Storybook**: Document if widely used
- **Testing**: Unit tests + integration tests
- **Examples**: FormField, SearchBar, Card

#### Organisms

- **Definition**: Complex UI sections (headers, forms, tables)
- **Storybook**: Document if used across multiple pages
- **Testing**: Integration tests + user flow tests
- **Examples**: Navigation, DataTable, Form

#### Templates

- **Definition**: Page layouts and structures
- **Storybook**: Rarely document
- **Testing**: Page-level integration tests
- **Examples**: DashboardLayout, AdminLayout

#### Pages

- **Definition**: Complete user interfaces
- **Storybook**: Never document
- **Testing**: End-to-end tests
- **Examples**: Dashboard, Users, SmartMenus

### Component Decision Matrix

| Component Type | Storybook         | Unit Tests  | Integration Tests | E2E Tests      |
| -------------- | ----------------- | ----------- | ----------------- | -------------- |
| Atom           | ✅ Always         | ✅ Required | ❌ Not needed     | ❌ Not needed  |
| Molecule       | ⚠️ If widely used | ✅ Required | ✅ Required       | ❌ Not needed  |
| Organism       | ⚠️ If cross-page  | ✅ Required | ✅ Required       | ⚠️ If critical |
| Template       | ❌ Rarely         | ✅ Required | ✅ Required       | ✅ Required    |
| Page           | ❌ Never          | ✅ Required | ✅ Required       | ✅ Required    |

## Testing Strategy

### Unit Tests

- **Coverage**: 90%+ for all components
- **Focus**: Individual component behavior
- **Tools**: Vitest + React Testing Library
- **Pattern**: Arrange-Act-Assert

### Integration Tests

- **Coverage**: All user flows and data interactions
- **Focus**: Component interactions and API calls
- **Tools**: Vitest + MSW for API mocking
- **Pattern**: User-centric testing

### End-to-End Tests

- **Coverage**: Critical user journeys
- **Focus**: Complete user workflows
- **Tools**: Cypress
- **Pattern**: Real user scenarios

### Storybook Tests

- **Coverage**: Only for documented components
- **Focus**: Visual regression and accessibility
- **Tools**: Storybook + axe-playwright
- **Pattern**: Component showcase testing

## Code Quality Standards

### Linting & Formatting

- **ESLint**: Strict configuration with TypeScript
- **Prettier**: Consistent code formatting
- **Pre-commit**: Automated checks
- **CI/CD**: Block on linting errors

### TypeScript

- **Strict Mode**: Enabled
- **Type Coverage**: 100% for public APIs
- **Interfaces**: Prefer over types for objects
- **Generics**: Use when appropriate

### Performance

- **Bundle Size**: Monitor and optimize
- **Lazy Loading**: Use for routes and heavy components
- **Memoization**: Use React.memo and useMemo appropriately
- **Code Splitting**: Implement for large features

## File Organization

### Directory Structure

```
src/
├── components/
│   ├── atoms/          # Basic building blocks
│   ├── molecules/      # Simple combinations
│   ├── organisms/      # Complex sections
│   └── ui/            # shadcn/ui components
├── features/          # Feature-based organization
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── __tests__/        # Test files
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserTable.tsx`)
- **Files**: kebab-case (e.g., `user-table.test.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useUserData.ts`)
- **Types**: PascalCase (e.g., `UserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

### Data Source Naming Convention

#### Pattern: `{DataSource}_{Transport}`

**Hook Naming:**

- `useDataWarehouse_Lambda` - Data from EveryBite Data Warehouse via Lambda (GraphQL interface)
- `useAPI_GraphQL` - Data from old API via GraphQL
- `useAPI_REST` - Data from old API via REST (if needed)

**File Naming:**

- `datawarehouse-lambda-apollo.ts` - Apollo client for Data Warehouse via Lambda
- `api-graphql-apollo.ts` - Apollo client for API via GraphQL
- `useDataWarehouse_Lambda.ts` - Hook for Data Warehouse via Lambda

**Directory Structure:**

```
src/
├── lib/
│   ├── datawarehouse-lambda-apollo.ts    # Transport-specific client
│   └── api-graphql-apollo.ts            # Transport-specific client
├── hooks/
│   ├── datawarehouse/                    # Data source grouping
│   │   ├── useDataWarehouse_Lambda.ts
│   │   └── useDataWarehouseUsers_Lambda.ts
│   └── api/                             # Data source grouping
│       └── useAPI_GraphQL.ts
└── features/dashboard/
    ├── hooks/
    │   ├── datawarehouse-lambda/         # Source + transport
    │   └── api-graphql/                  # Source + transport
    └── graphql/
        ├── datawarehouse-lambda/         # Source + transport
        └── api-graphql/                  # Source + transport
```

**Naming Rules:**

- **Use PascalCase** for hook names: `useDataWarehouse_Lambda`
- **Use kebab-case** for files: `datawarehouse-lambda-apollo.ts`
- **Use camelCase** for variables: `dataWarehouseLambdaClient`
- **Separate with underscores** for multiple concepts: `Source_Transport`
- **Be explicit about data source** (DataWarehouse vs API)
- **Distinguish transport layer** (Lambda vs GraphQL vs REST)
- **Assume GraphQL interface** unless specified otherwise

**Documentation:**

```typescript
/**
 * Hook for fetching dashboard data from EveryBite Data Warehouse
 * via AWS Lambda function with GraphQL interface
 */
export function useDataWarehouse_Lambda() {
  // Implementation
}
```

## API Integration

### Data Fetching

- **Pattern**: Custom hooks for API calls
- **Error Handling**: Consistent error boundaries
- **Loading States**: Always provide loading indicators
- **Caching**: Implement appropriate caching strategies

### State Management

- **Local State**: React useState/useReducer
- **Global State**: React Context for app-wide state
- **Server State**: Custom hooks with caching
- **Form State**: React Hook Form for complex forms

## Accessibility

### Standards

- **WCAG 2.1 AA**: Minimum compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Color Contrast**: Meet accessibility standards

### Testing

- **Automated**: axe-playwright in CI/CD
- **Manual**: Regular accessibility audits
- **User Testing**: Include users with disabilities

## Performance Guidelines

### React Best Practices

- **Avoid Re-renders**: Use React.memo, useMemo, useCallback
- **Lazy Loading**: Implement for routes and heavy components
- **Bundle Splitting**: Use dynamic imports
- **Image Optimization**: Use appropriate formats and sizes

### Monitoring

- **Bundle Analysis**: Regular bundle size monitoring
- **Performance Metrics**: Track Core Web Vitals
- **Error Tracking**: Monitor for performance issues

## Documentation Standards

### Code Documentation

- **JSDoc**: For public APIs and complex functions
- **README**: For each major feature
- **Comments**: Explain "why" not "what"
- **Examples**: Provide usage examples

### Component Documentation

- **Props Interface**: Clear prop definitions
- **Usage Examples**: Common use cases
- **Accessibility**: Document accessibility features
- **Performance**: Note any performance considerations

## Review Process

### Code Review Checklist

- [ ] Follows established patterns
- [ ] Includes appropriate tests
- [ ] Meets accessibility standards
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] No linting errors

### Review Guidelines

- **Constructive Feedback**: Focus on improvement
- **Consistency**: Maintain established patterns
- **Learning**: Share knowledge and best practices
- **Efficiency**: Keep reviews focused and timely

## Continuous Improvement

### Regular Reviews

- **Monthly**: Review and update this guide
- **Quarterly**: Assess development velocity and quality
- **Annually**: Major process improvements

### Feedback Loop

- **Team Input**: Gather feedback from all developers
- **Metrics**: Track development velocity and quality
- **Iteration**: Continuously improve processes

## Emergency Procedures

### Hot Fixes

- **Process**: Direct to main branch for critical issues
- **Testing**: Minimal testing for critical fixes
- **Follow-up**: Full testing and documentation after fix

### Rollbacks

- **Strategy**: Maintain ability to rollback quickly
- **Communication**: Clear communication about changes
- **Documentation**: Document what was rolled back and why

---

_This document is a living guide that should be updated as our development practices evolve._
