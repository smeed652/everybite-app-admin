// ============================================================================
// BUSINESS LOGIC TESTING UTILITIES
// ============================================================================

// Core testing patterns
export {
  createBusinessLogicTestSuite,
  createTestDataBuilder,
  createTestDataFactory,
  testBusinessRules,
  testDataTransformation,
  testEdgeCases,
  testNullHandling,
  testPerformance,
  testPureFunction,
  validatePureFunction,
} from "./test-patterns";

// Contract testing patterns
export {
  createContractTestSuite,
  createContractValidator,
  testApiResponseContracts,
  testDataTransformationContracts,
  testHookBusinessLogicContracts,
  testHookDataTransformationContracts,
  testServiceContracts,
  testServiceMethodSignatures,
} from "./contract-testing";

// Test migration utilities
export {
  analyzeTestStructure,
  categorizeTests,
  createMigrationPlan,
  createMigrationReport,
  generateMigrationTemplate,
  validateMigration,
} from "./test-migration";

// Test data factories
export {
  createAnalyticsFactory,
  createBusinessRuleFactory,
  createComprehensiveTestDataSet,
  createContractFactory,
  createDashboardMetricsFactory,
  createEdgeCaseFactory,
  createErrorFactory,
  createPerformanceFactory,
  createQuarterlyMetricsFactory,
  createScenarioTestData,
  createValidationFactory,
  createWidgetFactory,
} from "./test-data-factories";

// Type exports
export type {
  AnalyticsTestData,
  BusinessRuleTestData,
  ContractTestData,
  DashboardMetricsTestData,
  EdgeCaseTestData,
  ErrorTestData,
  PerformanceTestData,
  QuarterlyMetricsTestData,
  ValidationTestData,
  WidgetTestData,
} from "./test-data-factories";
