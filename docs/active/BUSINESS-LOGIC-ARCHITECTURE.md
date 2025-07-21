# Business Logic Architecture

## 📋 Overview

This document describes the business logic architecture implemented in the EveryBite Admin Application. The architecture separates business logic from UI components, making the codebase more maintainable, testable, and reusable.

## 🏗️ Architecture Principles

### **1. Separation of Concerns**

- **Business Logic**: Pure functions that handle data transformation, calculations, and validation
- **UI Components**: Handle presentation, user interaction, and state management
- **Services**: Handle data fetching and external API communication

### **2. Pure Functions**

- All business logic functions are pure (same input = same output)
- No side effects (no API calls, no DOM manipulation, no state changes)
- Functions are predictable and easily testable

### **3. UI Independence**

- Business logic works in any context (web, mobile, server)
- No dependencies on React, UI components, or browser APIs
- Can be used in different applications or contexts

### **4. Type Safety**

- Comprehensive TypeScript types for all inputs and outputs
- Clear contracts between different layers
- Compile-time error detection

## 📁 Directory Structure

```
src/business-logic/
├── README.md                    # Patterns and conventions
├── index.ts                     # Main export point
├── types/                       # Shared business logic types
│   ├── index.ts                # Export all types
│   ├── common.ts               # Common business logic types
│   └── validation.ts           # Validation-specific types
├── validation/                  # Data validation functions
│   ├── index.ts                # Export all validation functions
│   └── quarterly-metrics.ts    # Quarterly metrics validation
├── calculations/                # Business calculation functions
│   └── index.ts                # Export all calculation functions
├── utils/                       # Business logic utilities
│   └── index.ts                # Export all utilities
└── quarterly-metrics/           # Quarterly metrics business logic
    ├── transformers.ts         # Data transformation functions
    ├── calculations.ts         # Calculation functions
    └── __tests__/              # Tests for quarterly metrics
```

## 🔧 Core Components

### **1. Types (`src/business-logic/types/`)**

#### **Common Types (`common.ts`)**

- `BusinessLogicResult<T>`: Standard result wrapper for operations
- `ValidationResult`: Result for validation operations
- `GrowthMetrics`: Growth comparison data
- `TimePeriod`: Time period for calculations
- `PaginationParams/Result`: Pagination support
- `QueryParams`: Query parameters for data operations
- `BusinessLogicConfig`: Configuration for operations
- `BusinessLogicError`: Error handling

#### **Validation Types (`validation.ts`)**

- `ValidationRule`: Individual validation rules
- `ValidationError`: Detailed error information
- `DetailedValidationResult`: Extended validation results
- `ValidationSchema`: Schema for complex validation
- `ValidationContext`: Context for custom validation

### **2. Validation (`src/business-logic/validation/`)**

#### **Quarterly Metrics Validation (`quarterly-metrics.ts`)**

- `validateQuarterlyMetrics()`: Basic structure validation
- `validateQuarterlyMetricsDetailed()`: Detailed validation with warnings
- `validateQuarterLabel()`: Quarter label format validation
- `validateGrowthPercentage()`: Growth percentage validation
- `validateChronologicalOrder()`: Data order validation

### **3. Calculations (`src/business-logic/calculations/`)**

#### **Quarterly Metrics Calculations (`quarterly-metrics/calculations.ts`)**

- `calculateGrowthMetrics()`: Growth between two values
- `calculateTotalOrders()`: Sum of orders across quarters
- `calculateTotalRevenue()`: Sum of revenue across quarters
- `calculateAverageOrdersPerQuarter()`: Average orders per quarter
- `calculateOrdersDelta()`: Orders growth percentage
- `calculateMetricGrowthRate()`: Growth rate for any metric
- `calculateCAGR()`: Compound annual growth rate
- `calculateTrendDirection()`: Trend analysis
- `calculateQoQGrowth()`: Quarter-over-quarter growth
- `calculateYoYGrowth()`: Year-over-year growth
- `calculateSummaryStatistics()`: Comprehensive statistics

### **4. Transformers (`src/business-logic/quarterly-metrics/transformers.ts`)**

#### **Data Transformation Functions**

- `transformQuarterlyData()`: Transform Lambda data to UI format
- `calculateTotalOrders()`: Calculate total orders (legacy)
- `calculateOrdersDelta()`: Calculate orders delta (legacy)
- `validateQuarterlyMetrics()`: Validate data structure (legacy)

#### **Interfaces**

- `QuarterlyMetricInput`: Input data structure from Lambda
- `QuarterlyMetricOutput`: Output data structure for UI

## 🔄 Data Flow

### **1. Lambda → Business Logic → UI**

```typescript
// 1. Lambda returns raw data
const lambdaData: QuarterlyMetricInput[] = await fetchQuarterlyMetrics();

// 2. Business logic transforms and validates
const validationResult = validateQuarterlyMetrics(lambdaData);
if (!validationResult.isValid) {
  // Handle validation errors
}

const transformedData = transformQuarterlyData(lambdaData);
const calculations = calculateSummaryStatistics(transformedData);

// 3. UI receives clean, processed data
return {
  data: transformedData,
  statistics: calculations.data,
  validation: validationResult,
};
```

### **2. Business Logic Layer Responsibilities**

#### **Data Transformation**

- Convert between different data formats
- Handle missing or malformed data
- Provide consistent output structure

#### **Validation**

- Validate data structure and types
- Check for business rule violations
- Provide detailed error reporting

#### **Calculations**

- Perform business calculations
- Generate analytics and metrics
- Handle edge cases and errors

## 🧪 Testing Strategy

### **1. Unit Testing**

- Each business logic function has comprehensive unit tests
- Tests cover all edge cases and error conditions
- Tests are UI-independent and fast

### **2. Test Structure**

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

### **3. Test Categories**

- **Happy Path**: Normal, expected inputs
- **Edge Cases**: Boundary conditions and limits
- **Error Conditions**: Invalid inputs and error handling
- **Performance**: Large datasets and performance characteristics

## 📦 Import/Export Patterns

### **1. Main Import**

```typescript
// Import from main business logic index
import {
  transformQuarterlyData,
  validateQuarterlyMetrics,
  calculateSummaryStatistics,
  BusinessLogicResult,
  ValidationResult,
} from "@/business-logic";
```

### **2. Specific Imports**

```typescript
// Import specific functionality
import { transformQuarterlyData } from "@/business-logic/quarterly-metrics/transformers";
import { validateQuarterlyMetrics } from "@/business-logic/validation/quarterly-metrics";
import { calculateTotalOrders } from "@/business-logic/calculations";
```

## 🔄 Migration Guidelines

### **1. Moving Logic from UI Components**

#### **Step 1: Identify Pure Functions**

- Look for functions that don't depend on UI state
- Identify data transformation and calculation logic
- Find validation logic that can be extracted

#### **Step 2: Extract to Business Logic**

- Create appropriate business logic files
- Define proper TypeScript interfaces
- Implement pure functions with clear contracts

#### **Step 3: Update UI Components**

- Import business logic functions
- Remove duplicated logic from UI components
- Update component tests to focus on UI behavior

#### **Step 4: Write Business Logic Tests**

- Create comprehensive unit tests
- Test all edge cases and error conditions
- Ensure 100% test coverage

### **2. Adding New Business Logic**

#### **Step 1: Determine Location**

- Choose appropriate directory based on function purpose
- Follow existing naming conventions
- Update index files for exports

#### **Step 2: Define Types**

- Create proper TypeScript interfaces
- Define input/output contracts
- Use existing type patterns

#### **Step 3: Implement Function**

- Follow pure function principles
- Handle all edge cases gracefully
- Provide clear error handling

#### **Step 4: Write Tests**

- Create comprehensive unit tests
- Test all scenarios and edge cases
- Ensure function is well-tested

## 🚫 Anti-Patterns to Avoid

### **1. UI Dependencies**

```typescript
// ❌ Bad: UI-dependent business logic
export function updateDashboardMetrics(component: ReactComponent) {
  component.setState({ loading: true });
  fetch("/api/metrics").then((data) => {
    component.setState({ metrics: data, loading: false });
  });
}

// ✅ Good: Pure business logic
export function transformMetrics(data: any[]): MetricsOutput[] {
  return data.map((item) => ({
    // transformation logic
  }));
}
```

### **2. Side Effects**

```typescript
// ❌ Bad: Function with side effects
export function processData(data: any[]) {
  localStorage.setItem("processed", JSON.stringify(data));
  return data.map(transform);
}

// ✅ Good: Pure function
export function processData(data: any[]): ProcessedData[] {
  return data.map(transform);
}
```

### **3. Complex State Management**

```typescript
// ❌ Bad: Complex state in business logic
export function calculateMetrics(state: ComplexState): Metrics {
  if (state.loading) return null;
  if (state.error) throw new Error(state.error);
  // complex state-dependent logic
}

// ✅ Good: Simple input/output
export function calculateMetrics(data: InputData): Metrics {
  return {
    // calculation logic
  };
}
```

## 🎯 Success Metrics

### **1. Code Quality**

- [ ] All business logic functions are pure and testable
- [ ] UI components only handle presentation logic
- [ ] Business logic is reusable across different contexts
- [ ] All functions have comprehensive test coverage

### **2. Maintainability**

- [ ] Clear separation between business logic and UI
- [ ] Consistent patterns across all business logic
- [ ] Well-documented functions and types
- [ ] Easy to understand and modify

### **3. Performance**

- [ ] Business logic functions are fast and efficient
- [ ] No unnecessary computations or side effects
- [ ] Proper error handling without performance impact
- [ ] Scalable for large datasets

### **4. Developer Experience**

- [ ] Clear import/export patterns
- [ ] Comprehensive TypeScript types
- [ ] Good IDE support and autocomplete
- [ ] Easy to test and debug

## 🔮 Future Enhancements

### **1. Caching Layer**

- Implement caching for expensive calculations
- Cache validation results for performance
- Add cache invalidation strategies

### **2. Advanced Validation**

- Schema-based validation with JSON Schema
- Custom validation rules and constraints
- Validation performance optimization

### **3. Performance Monitoring**

- Add performance metrics for business logic
- Monitor function execution times
- Track cache hit rates and optimization opportunities

### **4. Documentation Generation**

- Auto-generate documentation from TypeScript types
- Create interactive examples and playgrounds
- Generate API documentation for business logic

---

## 📚 References

- [Business Logic Patterns](https://martinfowler.com/bliki/BusinessLogic.html)
- [Pure Functions](https://en.wikipedia.org/wiki/Pure_function)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)

---

_Last Updated: 2025-01-15_
_Architecture Version: 1.0_
_Status: Implemented_
