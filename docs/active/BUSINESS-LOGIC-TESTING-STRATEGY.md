# Business Logic Testing Strategy

## Overview

This document outlines our approach to testing business logic separately from UI logic, ensuring that core functionality remains stable during UI refactors.

## Directory Structure

```
src/
├── business-logic/           # Pure business logic functions
│   ├── quarterly-metrics/
│   │   ├── transformers.ts   # Data transformation logic
│   │   ├── validators.ts     # Data validation logic
│   │   ├── calculators.ts    # Business calculations
│   │   └── __tests__/
│   │       ├── transformers.test.ts
│   │       ├── validators.test.ts
│   │       └── calculators.test.ts
│   ├── smartmenu-analytics/
│   │   ├── metrics.ts
│   │   └── __tests__/
│   └── cache-management/
│       ├── strategies.ts
│       └── __tests__/
├── hooks/                    # React hooks (business logic + UI state)
│   ├── __tests__/
│   │   ├── business-logic.test.ts    # Tests business logic in hooks
│   │   └── ui-behavior.test.ts       # Tests UI-specific behavior
│   └── ...
├── components/               # Pure UI components
│   ├── __tests__/
│   │   ├── rendering.test.ts         # Tests component rendering
│   │   └── interactions.test.ts      # Tests user interactions
│   └── ...
└── integration/              # Integration tests
    ├── __tests__/
    │   ├── data-flow.test.ts         # Tests complete data flow
    │   └── api-contracts.test.ts     # Tests API contracts
    └── ...
```

## Testing Categories

### 1. **Business Logic Tests** (Pure Functions)

- **Location**: `src/business-logic/**/__tests__/`
- **Purpose**: Test pure functions that transform/validate/calculate data
- **UI Independence**: No React, no DOM, no UI dependencies
- **Examples**: Data transformers, validators, calculators

### 2. **Hook Business Logic Tests** (React Hooks)

- **Location**: `src/hooks/__tests__/business-logic.test.ts`
- **Purpose**: Test business logic within React hooks
- **UI Independence**: Use `renderHook`, test data transformation, not UI
- **Examples**: Data processing, state calculations, error handling

### 3. **UI Behavior Tests** (React Components)

- **Location**: `src/components/__tests__/` and `src/hooks/__tests__/ui-behavior.test.ts`
- **Purpose**: Test UI-specific behavior (rendering, interactions)
- **UI Dependent**: Can test DOM elements, user interactions
- **Examples**: Component rendering, user interactions, loading states

### 4. **Integration Tests** (End-to-End)

- **Location**: `src/integration/__tests__/`
- **Purpose**: Test complete data flow and API contracts
- **Scope**: Full stack integration, API responses
- **Examples**: Data flow from API to UI, error handling across layers

## Development Process

### Phase 1: Business Logic First

1. **Write business logic functions** (pure functions)
2. **Write business logic tests** (comprehensive, edge cases)
3. **Verify business logic works** (all tests pass)

### Phase 2: Hook Integration

1. **Create React hooks** that use business logic functions
2. **Write hook business logic tests** (test data transformation)
3. **Verify hooks work correctly** (business logic tests pass)

### Phase 3: UI Implementation

1. **Create UI components** that use hooks
2. **Write UI behavior tests** (test rendering, interactions)
3. **Verify UI works** (all tests pass)

### Phase 4: Integration

1. **Write integration tests** (test complete flow)
2. **Verify end-to-end functionality** (integration tests pass)

## Testing Principles

### Business Logic Tests

- ✅ **Pure functions only** - No side effects, no external dependencies
- ✅ **Comprehensive edge cases** - Null, undefined, malformed data
- ✅ **Type safety** - Ensure output types are correct
- ✅ **Performance** - Test with large datasets if applicable

### Hook Business Logic Tests

- ✅ **Data transformation** - Test how data flows through hooks
- ✅ **State management** - Test state changes and calculations
- ✅ **Error handling** - Test error states and recovery
- ❌ **No UI testing** - Don't test DOM elements or user interactions

### UI Behavior Tests

- ✅ **Component rendering** - Test that components render correctly
- ✅ **User interactions** - Test clicks, form submissions, etc.
- ✅ **Loading states** - Test loading, error, success states
- ❌ **No business logic testing** - Don't test data transformation here

## Example Implementation

### Business Logic Function

```typescript
// src/business-logic/quarterly-metrics/transformers.ts
export function transformQuarterlyData(quarterlyMetrics: any[]) {
  return (
    quarterlyMetrics?.map((item) => ({
      quarter: item.quarterLabel,
      brands: item.brands?.count || item.activeSmartMenus?.count || 0,
      locations: item.locations?.count || 0,
      activeSmartMenus: item.activeSmartMenus?.count || 0,
      orders: item.orders?.count || 0,
      ordersQoQGrowth: item.orders?.qoqGrowthPercent || 0,
    })) || []
  );
}
```

### Business Logic Test

```typescript
// src/business-logic/quarterly-metrics/__tests__/transformers.test.ts
describe("transformQuarterlyData", () => {
  it("should handle missing brands field with fallback", () => {
    const input = [{ quarterLabel: "Q3 2025", activeSmartMenus: { count: 5 } }];
    const result = transformQuarterlyData(input);
    expect(result[0].brands).toBe(5); // Falls back to activeSmartMenus
  });
});
```

### Hook Business Logic Test

```typescript
// src/hooks/__tests__/business-logic.test.ts
describe("useSmartMenuDashboard - Business Logic", () => {
  it("should transform quarterly metrics correctly", () => {
    const { result } = renderHook(() => useSmartMenuDashboard());
    expect(result.current.quarterlyMetrics).toHaveLength(1);
  });
});
```

### UI Behavior Test

```typescript
// src/components/__tests__/QuarterlyMetricsTable.test.tsx
describe("QuarterlyMetricsTable - UI Behavior", () => {
  it("should display loading state", () => {
    render(<QuarterlyMetricsTable loading={true} />);
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });
});
```

## Benefits

1. **UI Refactor Safety** - Business logic tests remain stable during UI changes
2. **Clear Separation** - Easy to identify what's business logic vs UI
3. **Better Test Coverage** - Comprehensive testing of edge cases
4. **Faster Development** - Business logic can be developed independently
5. **Easier Debugging** - Clear separation makes issues easier to isolate

## Migration Strategy

1. **Extract business logic** from existing components/hooks
2. **Create pure functions** for data transformation
3. **Write business logic tests** for extracted functions
4. **Update components/hooks** to use pure functions
5. **Refactor existing tests** to focus on UI behavior
6. **Add integration tests** for complete data flow

## Tools & Conventions

- **Test Naming**: `*.business-logic.test.ts` for business logic, `*.ui-behavior.test.ts` for UI
- **Test Organization**: Group by functionality, not by file structure
- **Mock Strategy**: Mock external dependencies, not business logic
- **Type Safety**: Use TypeScript for all business logic functions
- **Documentation**: Document complex business logic with examples
