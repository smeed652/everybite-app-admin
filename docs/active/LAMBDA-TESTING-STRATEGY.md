# Lambda Testing Strategy

## 📋 Overview

This document outlines our comprehensive testing strategy for Lambda functions in the EveryBite Admin application. Our Lambda functions serve as the backend for GraphQL analytics queries and data processing.

## 🎯 Testing Objectives

- **Ensure Lambda function reliability and correctness**
- **Validate GraphQL schema and query performance**
- **Test data transformation and aggregation logic**
- **Verify error handling and edge cases**
- **Maintain data consistency across queries**
- **Support continuous deployment with confidence**

## 🏗️ Testing Architecture

### Three-Tier Testing Approach

#### **1. Unit Testing (Lambda Level)**

- **Scope**: Individual Lambda resolvers and business logic
- **Tools**: Jest/Vitest, AWS Lambda Test Utils
- **Coverage**: 90%+ code coverage target
- **Location**: `lambda/` directory tests

#### **2. Integration Testing (API Level)**

- **Scope**: Lambda function endpoints with real GraphQL queries
- **Tools**: GraphQL testing utilities, HTTP client testing
- **Coverage**: All GraphQL queries and mutations
- **Location**: `src/__tests__/api/` directory

#### **3. End-to-End Testing (System Level)**

- **Scope**: Complete data flow from Lambda to frontend
- **Tools**: Cypress, Playwright, or similar E2E tools
- **Coverage**: Critical user journeys and data flows
- **Location**: `cypress/e2e/` directory

## 📝 Implementation Plan

### Phase 1: Lambda Unit Testing Setup

#### **1.1 Test Infrastructure Setup**

```bash
# Directory structure
lambda/
├── __tests__/
│   ├── unit/
│   │   ├── resolvers/
│   │   ├── business-logic/
│   │   └── utils/
│   ├── integration/
│   │   ├── graphql/
│   │   └── api/
│   └── fixtures/
│       ├── mock-data/
│       └── test-queries/
├── package.json
└── vitest.config.js
```

#### **1.2 Unit Test Implementation**

- **Resolver Tests**: Test individual GraphQL resolvers
- **Business Logic Tests**: Test data transformation functions
- **Utility Tests**: Test helper functions and utilities
- **Mock External Dependencies**: Mock Athena, Metabase proxy calls

#### **1.3 Test Data Management**

- **Mock Data**: Create realistic test data fixtures
- **Test Queries**: Standardized GraphQL test queries
- **Expected Results**: Define expected outcomes for each test

### Phase 2: Lambda Integration Testing

#### **2.1 GraphQL Query Testing**

```typescript
// Example integration test structure
describe("Lambda GraphQL Integration", () => {
  test("dashboardMetrics query returns expected structure", async () => {
    const result = await executeLambdaQuery(
      "dashboardMetrics",
      DASHBOARD_METRICS_QUERY
    );

    expect(result.data.dashboardMetrics).toBeDefined();
    expect(result.data.dashboardMetrics.widgetSummary).toBeDefined();
    expect(result.data.dashboardMetrics.quarterlyMetrics).toBeInstanceOf(Array);
  });
});
```

#### **2.2 Performance Testing**

- **Response Time**: Ensure queries complete within acceptable timeframes
- **Concurrent Requests**: Test Lambda function under load
- **Memory Usage**: Monitor Lambda memory consumption
- **Cold Start Performance**: Test function initialization time

#### **2.3 Error Scenario Testing**

- **Invalid Queries**: Test malformed GraphQL queries
- **Authentication Failures**: Test API key validation
- **External Service Failures**: Test Athena/Metabase proxy failures
- **Data Validation**: Test invalid data scenarios

### Phase 3: End-to-End Testing

#### **3.1 Frontend Integration Testing**

- **Data Flow**: Test complete Lambda → Frontend data flow
- **Cache Integration**: Test Lambda responses with Apollo cache
- **Real-time Updates**: Test data synchronization
- **Error Handling**: Test error scenarios in UI

#### **3.2 User Journey Testing**

- **Dashboard Loading**: Test dashboard metrics loading from Lambda
- **SmartMenu Settings**: Test SmartMenu data retrieval
- **Analytics Queries**: Test analytics data display
- **Error Recovery**: Test error states and recovery

## 🛠️ Testing Tools & Technologies

### **Unit Testing**

- **Framework**: Vitest (for consistency with frontend)
- **Mocking**: Vitest mocks for external dependencies
- **Coverage**: @vitest/coverage-v8 for coverage reporting
- **Assertions**: Vitest assertions and custom matchers

### **Integration Testing**

- **GraphQL Testing**: GraphQL testing utilities
- **HTTP Client**: Axios or fetch for API testing
- **Test Environment**: Node.js test environment
- **Mock Server**: MSW (Mock Service Worker) for API mocking

### **End-to-End Testing**

- **Framework**: Cypress or Playwright
- **Test Runner**: Cypress Test Runner
- **Visual Testing**: Screenshot comparison
- **Performance**: Lighthouse CI integration

## 📊 Test Coverage Requirements

### **Unit Tests**

- **Code Coverage**: 90%+ for all Lambda functions
- **Branch Coverage**: 85%+ for critical paths
- **Function Coverage**: 100% for all exported functions
- **Error Paths**: 100% coverage for error handling

### **Integration Tests**

- **Query Coverage**: 100% for all GraphQL queries
- **Mutation Coverage**: 100% for all GraphQL mutations
- **Schema Coverage**: 100% for GraphQL schema validation
- **Performance Coverage**: All performance-critical paths

### **End-to-End Tests**

- **User Journey Coverage**: All critical user flows
- **Data Flow Coverage**: Complete Lambda → Frontend flows
- **Error Scenario Coverage**: All error handling scenarios
- **Cross-browser Coverage**: Major browser compatibility

## 🔧 Test Configuration

### **Vitest Configuration for Lambda**

```javascript
// lambda/vitest.config.js
export default {
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./__tests__/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "__tests__/", "*.config.js"],
    },
  },
};
```

### **Test Setup and Utilities**

```javascript
// lambda/__tests__/setup.js
import { vi } from "vitest";

// Mock AWS SDK
vi.mock("aws-sdk", () => ({
  Athena: vi.fn(),
  Lambda: vi.fn(),
}));

// Mock external services
vi.mock("../services/metabase-proxy", () => ({
  queryMetabase: vi.fn(),
}));

// Global test utilities
global.testUtils = {
  createMockContext: () => ({
    callbackWaitsForEmptyEventLoop: false,
    functionName: "test-function",
    functionVersion: "1",
    invokedFunctionArn: "arn:aws:lambda:us-west-1:123456789012:function:test",
    memoryLimitInMB: "128",
    awsRequestId: "test-request-id",
    logGroupName: "/aws/lambda/test",
    logStreamName: "2023/01/01/[$LATEST]test",
    getRemainingTimeInMillis: () => 30000,
    done: vi.fn(),
    fail: vi.fn(),
    succeed: vi.fn(),
  }),

  createMockEvent: (query, variables = {}) => ({
    body: JSON.stringify({
      query,
      variables,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-api-key",
    },
  }),
};
```

## 📋 Test Implementation Examples

### **Unit Test Example**

```javascript
// lambda/__tests__/unit/resolvers/dashboardMetrics.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { dashboardMetricsResolver } from "../../resolvers/dashboardMetrics";
import { mockAthenaData } from "../fixtures/mock-data";

describe("dashboardMetricsResolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return dashboard metrics with correct structure", async () => {
    const mockContext = {
      athenaClient: {
        query: vi.fn().mockResolvedValue(mockAthenaData),
      },
    };

    const result = await dashboardMetricsResolver({}, {}, mockContext);

    expect(result).toHaveProperty("widgetSummary");
    expect(result).toHaveProperty("quarterlyMetrics");
    expect(result).toHaveProperty("kpis");
    expect(result.quarterlyMetrics).toBeInstanceOf(Array);
  });

  it("should handle Athena query errors gracefully", async () => {
    const mockContext = {
      athenaClient: {
        query: vi.fn().mockRejectedValue(new Error("Athena error")),
      },
    };

    await expect(dashboardMetricsResolver({}, {}, mockContext)).rejects.toThrow(
      "Athena error"
    );
  });
});
```

### **Integration Test Example**

```javascript
// lambda/__tests__/integration/graphql/dashboardMetrics.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestClient } from "apollo-server-testing";
import { ApolloServer } from "apollo-server-lambda";
import { schema } from "../../schema";
import { DASHBOARD_METRICS_QUERY } from "../fixtures/test-queries";

describe("Dashboard Metrics GraphQL Integration", () => {
  let server;
  let testClient;

  beforeAll(async () => {
    server = new ApolloServer({
      schema,
      context: () => ({
        athenaClient: mockAthenaClient,
        metabaseProxy: mockMetabaseProxy,
      }),
    });

    testClient = createTestClient(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("should execute dashboardMetrics query successfully", async () => {
    const { data, errors } = await testClient.query({
      query: DASHBOARD_METRICS_QUERY,
    });

    expect(errors).toBeUndefined();
    expect(data.dashboardMetrics).toBeDefined();
    expect(data.dashboardMetrics.widgetSummary).toBeDefined();
  });

  it("should handle authentication errors", async () => {
    const serverWithoutAuth = new ApolloServer({
      schema,
      context: () => ({}), // No authentication
    });

    const testClientWithoutAuth = createTestClient(serverWithoutAuth);

    const { errors } = await testClientWithoutAuth.query({
      query: DASHBOARD_METRICS_QUERY,
    });

    expect(errors).toBeDefined();
    expect(errors[0].message).toContain("Authentication required");
  });
});
```

### **End-to-End Test Example**

```javascript
// cypress/e2e/lambda-integration.cy.ts
describe("Lambda Integration E2E", () => {
  it("should load dashboard metrics from Lambda", () => {
    cy.visit("/dashboard");

    // Wait for Lambda data to load
    cy.get('[data-testid="metrics-card"]').should("have.length", 4);

    // Verify metrics are populated
    cy.get('[data-testid="metrics-card"]')
      .first()
      .should("contain.text", "SmartMenus")
      .and("not.contain.text", "0");

    // Verify quarterly metrics table
    cy.get('[data-testid="quarterly-metrics-table"]')
      .should("be.visible")
      .and("contain.text", "Q1 2024");
  });

  it("should handle Lambda errors gracefully", () => {
    // Intercept Lambda calls and return error
    cy.intercept("POST", "**/lambda-url**", {
      statusCode: 500,
      body: { error: "Internal server error" },
    }).as("lambdaError");

    cy.visit("/dashboard");

    // Should show error state
    cy.get('[data-testid="error-message"]')
      .should("be.visible")
      .and("contain.text", "Failed to load dashboard metrics");
  });
});
```

## 🚀 CI/CD Integration

### **GitHub Actions Workflow**

```yaml
# .github/workflows/lambda-tests.yml
name: Lambda Tests

on:
  push:
    paths:
      - "lambda/**"
      - "src/__tests__/api/**"
  pull_request:
    paths:
      - "lambda/**"
      - "src/__tests__/api/**"

jobs:
  lambda-unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: lambda/package-lock.json

      - name: Install dependencies
        run: |
          cd lambda
          npm ci

      - name: Run unit tests
        run: |
          cd lambda
          npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: lambda/coverage/lcov.info

  lambda-integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:lambda:integration
        env:
          LAMBDA_URL: ${{ secrets.LAMBDA_URL }}
          API_KEY: ${{ secrets.API_KEY }}
```

## 📈 Monitoring & Reporting

### **Test Metrics Dashboard**

- **Test Coverage**: Real-time coverage reporting
- **Test Performance**: Execution time tracking
- **Failure Analysis**: Automated failure categorization
- **Trend Analysis**: Historical test performance trends

### **Quality Gates**

- **Coverage Threshold**: 90%+ unit test coverage required
- **Performance Threshold**: All tests must complete within 30 seconds
- **Failure Threshold**: 0% test failure rate for critical paths
- **Security Threshold**: All security-related tests must pass

## 🔄 Continuous Improvement

### **Regular Review Process**

- **Weekly**: Review test coverage and performance metrics
- **Bi-weekly**: Analyze test failures and flaky tests
- **Monthly**: Update test strategy based on new requirements
- **Quarterly**: Comprehensive test strategy review and updates

### **Feedback Loop**

- **Developer Feedback**: Collect feedback on test utility and coverage
- **Test Maintenance**: Regular cleanup of obsolete tests
- **Strategy Updates**: Continuous refinement of testing approach
- **Tool Evaluation**: Regular assessment of testing tools and frameworks

## 📚 Resources & References

- **AWS Lambda Testing Best Practices**: AWS documentation
- **GraphQL Testing Guide**: Apollo GraphQL testing documentation
- **Vitest Documentation**: Vitest testing framework guide
- **Cypress Testing**: Cypress end-to-end testing guide
- **Test Coverage Standards**: Industry best practices for test coverage

---

## 📝 Notes

- **Lambda Testing Priority**: Critical for data integrity and system reliability
- **Test Data Management**: Essential for consistent and reliable tests
- **Performance Testing**: Important for user experience and cost optimization
- **Security Testing**: Critical for protecting sensitive data and API access
- **Continuous Integration**: Automated testing ensures code quality and reliability
