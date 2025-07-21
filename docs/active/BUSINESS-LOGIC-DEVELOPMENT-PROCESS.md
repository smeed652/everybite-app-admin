# Business Logic Development Process

## Overview

This document outlines the step-by-step process for implementing business logic testing in our development workflow.

## Development Workflow

### Step 1: Identify Business Logic

When working on a feature, identify what constitutes "business logic":

**Business Logic Examples:**

- Data transformation (API response → UI format)
- Calculations (totals, percentages, growth rates)
- Validation (data structure, required fields)
- State management (loading, error, success states)
- Business rules (feature flags, permissions)

**UI Logic Examples:**

- Component rendering
- User interactions (clicks, form submissions)
- Styling and layout
- Animation and transitions

### Step 2: Extract Business Logic

1. **Create pure functions** in `src/business-logic/`
2. **Define clear interfaces** for input/output
3. **Add comprehensive documentation**
4. **Write business logic tests first**

### Step 3: Implement Business Logic Tests

1. **Test all edge cases** (null, undefined, malformed data)
2. **Test data transformation** (input → output)
3. **Test calculations** (math, percentages, totals)
4. **Test validation** (error detection, data integrity)

### Step 4: Integrate with Hooks/Components

1. **Import business logic functions** in hooks/components
2. **Replace inline logic** with function calls
3. **Write hook business logic tests** (data flow)
4. **Write UI behavior tests** (rendering, interactions)

### Step 5: Integration Testing

1. **Test complete data flow** (API → Business Logic → UI)
2. **Test error handling** across all layers
3. **Test performance** with real data volumes

## File Naming Conventions

### Business Logic Files

```
src/business-logic/
├── quarterly-metrics/
│   ├── transformers.ts          # Data transformation
│   ├── validators.ts            # Data validation
│   ├── calculators.ts           # Business calculations
│   └── __tests__/
│       ├── transformers.test.ts
│       ├── validators.test.ts
│       └── calculators.test.ts
```

### Test Files

```
src/
├── business-logic/**/__tests__/
│   └── *.test.ts               # Business logic tests
├── hooks/__tests__/
│   ├── *.business-logic.test.ts # Hook business logic tests
│   └── *.ui-behavior.test.ts    # Hook UI behavior tests
├── components/__tests__/
│   ├── *.rendering.test.tsx     # Component rendering tests
│   └── *.interactions.test.tsx  # Component interaction tests
└── integration/__tests__/
    └── *.integration.test.ts    # End-to-end integration tests
```

## Testing Checklist

### Business Logic Tests

- [ ] **Pure functions only** - No side effects, no external dependencies
- [ ] **Comprehensive edge cases** - Null, undefined, empty arrays, malformed data
- [ ] **Type safety** - All inputs/outputs properly typed
- [ ] **Performance** - Test with large datasets if applicable
- [ ] **Documentation** - Clear examples in test descriptions

### Hook Business Logic Tests

- [ ] **Data transformation** - Test how data flows through hooks
- [ ] **State management** - Test state changes and calculations
- [ ] **Error handling** - Test error states and recovery
- [ ] **No UI testing** - Don't test DOM elements or user interactions

### UI Behavior Tests

- [ ] **Component rendering** - Test that components render correctly
- [ ] **User interactions** - Test clicks, form submissions, etc.
- [ ] **Loading states** - Test loading, error, success states
- [ ] **No business logic testing** - Don't test data transformation here

## Example Implementation

### Before (Mixed Logic)

```typescript
// Dashboard.tsx - Mixed business logic and UI
const quarterlyData =
  quarterlyMetrics?.map((item) => ({
    quarter: item.quarterLabel,
    brands: item.brands?.count || item.activeSmartMenus?.count || 0,
    // ... more transformation logic
  })) || [];

const totalOrders = quarterlyData.reduce(
  (sum, quarter) => sum + quarter.orders,
  0
);
```

### After (Separated Logic)

```typescript
// business-logic/quarterly-metrics/transformers.ts
export function transformQuarterlyData(quarterlyMetrics: any[]) {
  return (
    quarterlyMetrics?.map((item) => ({
      quarter: item.quarterLabel,
      brands: item.brands?.count || item.activeSmartMenus?.count || 0,
      // ... more transformation logic
    })) || []
  );
}

export function calculateTotalOrders(quarterlyData: any[]) {
  return quarterlyData.reduce((sum, quarter) => sum + quarter.orders, 0);
}

// Dashboard.tsx - Clean UI logic only
const quarterlyData = transformQuarterlyData(quarterlyMetrics);
const totalOrders = calculateTotalOrders(quarterlyData);
```

## Migration Strategy

### Phase 1: Extract Existing Logic

1. **Identify mixed logic** in components/hooks
2. **Create business logic functions** for data transformation
3. **Write comprehensive tests** for extracted functions
4. **Update components/hooks** to use new functions

### Phase 2: Refactor Tests

1. **Separate business logic tests** from UI tests
2. **Update existing tests** to focus on appropriate concerns
3. **Add missing edge cases** to business logic tests
4. **Remove UI-coupled tests** from business logic

### Phase 3: Establish Process

1. **Document patterns** for new development
2. **Create templates** for business logic files
3. **Train team** on new approach
4. **Review process** regularly

## Benefits Realized

1. **UI Refactor Safety** - Business logic tests remain stable during UI changes
2. **Better Test Coverage** - Comprehensive testing of edge cases
3. **Faster Development** - Business logic can be developed independently
4. **Easier Debugging** - Clear separation makes issues easier to isolate
5. **Code Reusability** - Business logic can be reused across components

## Common Pitfalls

### ❌ Don't Test UI in Business Logic Tests

```typescript
// Wrong - Testing UI in business logic test
it("should display correct data", () => {
  render(<Dashboard />);
  expect(screen.getByText("1000")).toBeInTheDocument();
});
```

### ✅ Do Test Data Transformation in Business Logic Tests

```typescript
// Correct - Testing data transformation
it("should transform quarterly data correctly", () => {
  const result = transformQuarterlyData(input);
  expect(result[0].orders).toBe(1000);
});
```

### ❌ Don't Test Business Logic in UI Tests

```typescript
// Wrong - Testing business logic in UI test
it("should calculate total orders", () => {
  render(<Dashboard />);
  const total = calculateTotalOrders(data); // Business logic in UI test
  expect(total).toBe(1800);
});
```

### ✅ Do Test UI Behavior in UI Tests

```typescript
// Correct - Testing UI behavior
it("should display loading state", () => {
  render(<Dashboard loading={true} />);
  expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
});
```

## Tools & Resources

- **Test Templates**: Use project templates for consistent test structure
- **Type Safety**: Use TypeScript for all business logic functions
- **Documentation**: Document complex business logic with examples
- **Code Review**: Ensure business logic is properly separated during reviews
