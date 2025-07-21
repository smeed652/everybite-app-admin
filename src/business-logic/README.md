# Business Logic Architecture

## 📋 Overview

This directory contains pure business logic functions that are UI-independent and can be tested separately. The goal is to separate business logic from UI components, making the codebase more maintainable and testable.

## 🏗️ Directory Structure

```
src/business-logic/
├── README.md                    # This file - patterns and conventions
├── types/                       # Shared business logic types and interfaces
│   ├── index.ts                # Export all types
│   ├── common.ts               # Common business logic types
│   └── validation.ts           # Validation-related types
├── validation/                  # Data validation functions
│   ├── index.ts                # Export all validation functions
│   ├── quarterly-metrics.ts    # Quarterly metrics validation
│   └── schemas.ts              # Validation schemas
├── calculations/                # Business calculation functions
│   ├── index.ts                # Export all calculation functions
│   ├── metrics.ts              # Metrics calculations
│   └── analytics.ts            # Analytics calculations
├── utils/                       # Business logic utilities
│   ├── index.ts                # Export all utilities
│   ├── data-transformers.ts    # Data transformation utilities
│   └── formatters.ts           # Data formatting utilities
└── quarterly-metrics/           # Quarterly metrics business logic
    ├── transformers.ts         # Data transformation functions
    ├── calculations.ts         # Calculation functions
    └── __tests__/              # Tests for quarterly metrics
```

## 🎯 Core Principles

### **1. Pure Functions**

- All business logic functions should be pure (same input = same output)
- No side effects (no API calls, no DOM manipulation, no state changes)
- Functions should be predictable and testable

### **2. UI Independence**

- Business logic should not depend on UI components
- No React hooks, components, or UI-specific logic
- Functions should work in any context (web, mobile, server)

### **3. Type Safety**

- All functions should have proper TypeScript types
- Input/output contracts should be clearly defined
- Use interfaces for complex data structures

### **4. Defensive Programming**

- Handle null/undefined inputs gracefully
- Provide sensible defaults for missing data
- Validate inputs and return meaningful errors

## 📝 Naming Conventions

### **Files:**

- Use kebab-case for file names: `quarterly-metrics.ts`
- Use descriptive names that indicate the purpose
- Group related functions in the same file

### **Functions:**

- Use camelCase for function names: `transformQuarterlyData`
- Use verb-noun format: `calculateTotalOrders`, `validateMetrics`
- Be descriptive and specific about what the function does

### **Types/Interfaces:**

- Use PascalCase for types: `QuarterlyMetricInput`
- Use descriptive names that indicate the data structure
- Suffix with purpose: `Input`, `Output`, `Result`, `Config`

### **Constants:**

- Use UPPER_SNAKE_CASE for constants: `DEFAULT_QUARTER_LABEL`
- Use descriptive names that indicate the value's purpose

## 🔧 Function Patterns

### **Transformation Functions:**

```typescript
export function transformData(input: InputType): OutputType {
  // Validate input
  if (!input) {
    return defaultValue;
  }

  // Transform data
  return transformedData;
}
```

### **Calculation Functions:**

```typescript
export function calculateMetric(data: DataType[]): number {
  return data.reduce((sum, item) => sum + item.value, 0);
}
```

### **Validation Functions:**

```typescript
export function validateData(data: any): ValidationResult {
  const errors: string[] = [];

  // Validation logic
  if (!data.requiredField) {
    errors.push("Required field is missing");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

## 🧪 Testing Guidelines

### **Test Structure:**

- One test file per business logic file
- Test all edge cases and error conditions
- Use descriptive test names that explain the scenario

### **Test Patterns:**

```typescript
describe("transformQuarterlyData", () => {
  it("should handle empty input", () => {
    const result = transformQuarterlyData(null);
    expect(result).toEqual([]);
  });

  it("should transform valid data", () => {
    const input = [
      /* test data */
    ];
    const result = transformQuarterlyData(input);
    expect(result).toEqual(/* expected output */);
  });

  it("should handle missing fields gracefully", () => {
    const input = [
      /* data with missing fields */
    ];
    const result = transformQuarterlyData(input);
    expect(result[0].orders).toBe(0);
  });
});
```

## 📦 Import/Export Patterns

### **Index Files:**

- Each directory should have an `index.ts` file
- Export all public functions and types
- Keep exports organized and documented

### **Import Structure:**

```typescript
// Import from business logic
import { transformQuarterlyData } from "@/business-logic/quarterly-metrics/transformers";
import { validateMetrics } from "@/business-logic/validation/quarterly-metrics";
import { calculateTotalOrders } from "@/business-logic/calculations/metrics";
```

## 🚫 Anti-Patterns to Avoid

### **Don't:**

- ❌ Mix UI logic with business logic
- ❌ Make API calls from business logic functions
- ❌ Use React hooks in business logic
- ❌ Mutate input parameters
- ❌ Create functions with side effects
- ❌ Use any types without proper validation

### **Do:**

- ✅ Keep functions pure and predictable
- ✅ Handle all edge cases gracefully
- ✅ Provide clear input/output contracts
- ✅ Write comprehensive tests
- ✅ Use proper TypeScript types
- ✅ Document complex logic

## 🔄 Migration Guidelines

### **When Moving Logic from UI Components:**

1. **Identify pure functions** that don't depend on UI state
2. **Extract to business logic** with proper types
3. **Update UI components** to import and use business logic
4. **Write tests** for the extracted functions
5. **Document** the new business logic functions

### **When Adding New Business Logic:**

1. **Determine the appropriate directory** based on function purpose
2. **Create proper types** for input/output
3. **Write the function** following patterns above
4. **Add comprehensive tests**
5. **Update index files** to export the new function
6. **Document** the function and its usage

## 📚 Examples

### **Good Example:**

```typescript
// Pure function with clear types
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}
```

### **Bad Example:**

```typescript
// ❌ Mixed UI and business logic
export function updateDashboardMetrics(component: ReactComponent) {
  component.setState({ loading: true });
  fetch("/api/metrics").then((data) => {
    component.setState({
      metrics: data,
      loading: false,
    });
  });
}
```

---

## 🎯 Success Metrics

- [ ] All business logic functions are pure and testable
- [ ] UI components only handle presentation logic
- [ ] Business logic is reusable across different contexts
- [ ] All functions have comprehensive test coverage
- [ ] Types are properly defined and used consistently
- [ ] Documentation is complete and up-to-date

---

_Last Updated: 2025-01-15_
_Architecture Version: 1.0_
