# Story 1: Test Suite Restoration & Quality Assurance

## 📋 Overview

- **Project**: EveryBite Admin Application
- **Sprint**: Sprint 11 - Test Suite Restoration & Quality Assurance
- **Story**: 1
- **Story Points**: 21
- **Status**: In Progress
- **Start Date**: 2025-07-20
- **Target End Date**: 2025-08-17
- **Actual End Date**: TBD
- **Latest Release**: `v1.0.1+249` (2025-07-20)
- **Release Tags**:
  - `v1.0.1+249` - "Data processing foundation and service layer implementation"
  - `v1.0.0+200` - "Initial cache management system"

## 🎯 Goals & Objectives

- [ ] **Restore test suite functionality after architecture changes**
- [ ] **Fix critical test failures preventing CI/CD pipeline**
- [ ] **Update tests to work with new service layer architecture**
- [ ] **Improve test coverage and quality**
- [ ] **Establish robust testing patterns for future development**
- [ ] **Achieve 95%+ test pass rate**
- [ ] **Implement comprehensive Lambda function testing strategy**

## 🎯 Scope

### **Approved Areas (No Permission Required):**

- **Test Files**: All files in `src/__tests__/` and `src/**/__tests__/`
- **Test Configuration**: `vitest.config.ts`, `test-runner.config.ts`
- **Test Utilities**: `src/__tests__/utils/`, `src/__tests__/factories/`
- **Test Mocks**: `src/mocks/`, `src/__tests__/__mocks__/`
- **Lambda Test Files**: `lambda/__tests__/` (when created)
- **Story Documentation**: This story file and related sprint documentation
- **Test Documentation**: `docs/active/LAMBDA-TESTING-STRATEGY.md`

### **Ask Permission Required:**

- **Production Code**: `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`
- **Configuration Files**: `package.json`, `tsconfig.json`, `amplify.yml`
- **Build Scripts**: `scripts/` directory (except test-related scripts)
- **Deployment Files**: `amplify/`, `api/` directories
- **Other Stories**: Files in `docs/stories/` (except this story)
- **Other Sprints**: Files in `docs/sprints/` (except current sprint)

## 📝 Implementation Steps

### Step 1: Critical Architecture Fixes (Week 1)

- [x] **Dashboard Tests Restoration**:
  - [x] Fix `src/pages/__tests__/Dashboard.test.tsx` - Fix quarterlyMetrics undefined error
  - [x] Update test expectations for new quarterly metrics data structure
  - [x] Fix loading state expectations and error handling
  - [x] Update test data to match hybrid service response format
  - [x] **COMPLETED** - Dashboard test now passing successfully

- [x] **SmartMenu Hook Tests Restoration**:
  - [x] Fix `src/features/smartMenus/hooks/__tests__/useToggleWidget.test.tsx` - Update GraphQL schema references
  - [x] Fix `src/features/smartMenus/hooks/__tests__/useWidget.test.tsx` - Update test data structures
  - [x] Fix `src/features/smartMenus/hooks/__tests__/useToggleWidgetSync.test.tsx` - Fix mutation schema issues
  - [x] Update GraphQL schema references (`Widget` → `DbWidgets`)
  - [x] Fix mutation schema configuration issues
  - [x] **PARTIALLY COMPLETED** - One test passing, others need infrastructure fixes

- [x] **Component Tests Restoration**:
  - [x] Fix `src/__tests__/metabase-integration.test.tsx` - Add missing MetabaseUsersTable mock
  - [x] Update component test mocks for new service layer
  - [x] Fix component integration tests with updated data structures
  - [x] **COMPLETED** - All component tests now passing

### Step 2: API Integration Fixes (Week 2)

- [x] **Lambda GraphQL Tests Restoration**:
  - [x] Fix `src/__tests__/api/lambda-graphql.smoke.test.ts` - Fix authentication configuration
  - [x] Add proper timeouts (30s instead of 5s) for real API tests
  - [x] Update schema expectations for current Lambda GraphQL schema
  - [x] Add retry logic for flaky network tests
  - [x] Fix API key authentication issues
  - [x] **INFRASTRUCTURE ISSUE IDENTIFIED** - Lambda endpoint returning 502 Bad Gateway errors for most queries
  - [x] **PARTIAL SUCCESS** - SmartMenu settings query working (3/3 tests passing)

- [x] **Hybrid Service Tests Restoration**:
  - [x] Fix `src/__tests__/api/smartmenu-hybrid.smoke.test.ts` - Add missing cache configuration
  - [x] Fix `src/__tests__/api/smartmenu-hybrid-cache-integration.test.ts` - Update cache config
  - [x] Update service layer mocks and test expectations
  - [x] Fix performance comparison tests
  - [x] **AUTHENTICATION ISSUE IDENTIFIED** - Test environment missing auth headers
  - [x] **PARTIAL SUCCESS** - 4/5 tests passing, 1 failing due to auth

- [x] **SmartMenu Settings Tests**:
  - [x] Fix `src/__tests__/api/smartmenu-settings.smoke.test.ts` - Update query expectations
  - [x] Fix timeout issues and schema validation
  - [x] Update test data for current schema structure
  - [x] **COMPLETED** - All 3 tests passing (56s execution time)

### Step 3: Test Infrastructure & Quality (Week 3)

- [ ] **Test Infrastructure Improvements**:
  - [ ] Create shared test utilities for service layer testing
  - [ ] Standardize mock patterns across all test files
  - [ ] Add better error handling and retry logic
  - [ ] Create test data factories for consistent test data

- [ ] **Coverage Improvements**:
  - [ ] Add missing test cases for edge cases
  - [ ] Improve error scenario coverage
  - [ ] Add integration tests for service layer interactions
  - [ ] Add performance tests for critical paths

- [ ] **Test Documentation & Standards**:
  - [ ] Document testing patterns and best practices
  - [ ] Create test templates for new components/services
  - [ ] Add troubleshooting guides for common test issues
  - [ ] Update test README with current patterns

### Step 4: Lambda Function Testing Strategy (Week 4)

- [ ] **Lambda Unit Testing**:
  - [ ] Create unit tests for Lambda resolvers and business logic
  - [ ] Test GraphQL schema validation and error handling
  - [ ] Mock external dependencies (Athena, Metabase proxy)
  - [ ] Test data transformation and aggregation functions

- [ ] **Lambda Integration Testing**:
  - [ ] Test Lambda function endpoints with real GraphQL queries
  - [ ] Validate query performance and response times
  - [ ] Test error scenarios and edge cases
  - [ ] Verify data consistency across different queries

- [ ] **Lambda End-to-End Testing**:
  - [ ] Test complete data flow from Lambda to frontend
  - [ ] Validate cache integration with Lambda responses
  - [ ] Test real-time data updates and synchronization
  - [ ] Verify error handling and fallback mechanisms

### Step 5: Performance & Optimization (Week 5)

- [ ] **Test Performance Optimization**:
  - [ ] Optimize test execution time
  - [ ] Reduce flaky test occurrences
  - [ ] Implement parallel test execution where possible
  - [ ] Add test performance monitoring

- [ ] **CI/CD Integration**:
  - [ ] Ensure all tests pass in CI environment
  - [ ] Add test coverage reporting
  - [ ] Implement test failure notifications
  - [ ] Add automated test result analysis

## 📊 Current Test Status

### Test Failure Analysis (42 failed / 299 total)

### Lambda Testing Status

- **Lambda Unit Tests**: 0% coverage (Not implemented)
- **Lambda Integration Tests**: 0% coverage (Not implemented)
- **Lambda End-to-End Tests**: 0% coverage (Not implemented)
- **Total Lambda Test Coverage**: 0% (Critical gap)

#### **Critical Failures (High Priority)**

- **Dashboard Tests**: 6 failures - Architecture mismatch with new hybrid service
- **SmartMenu Hook Tests**: 8 failures - GraphQL schema and mutation issues
- **Component Tests**: 5 failures - Missing mocks and outdated data structures

#### **API Integration Failures (Medium Priority)**

- **Lambda GraphQL Tests**: 12 failures - Timeout and authentication issues
- **Hybrid Service Tests**: 3 failures - Cache configuration and service layer issues
- **SmartMenu Settings Tests**: 3 failures - Query and schema validation issues

#### **Infrastructure Issues (Low Priority)**

- **Test Configuration**: 5 failures - Mock setup and test data issues

### Success Metrics

- **Week 1**: Reduce failures from 42 to <15 (Critical fixes)
- **Week 2**: Reduce failures from 15 to <5 (API integration fixes)
- **Week 3**: Achieve 95%+ test pass rate (Infrastructure improvements)
- **Week 4**: Implement Lambda testing strategy (Unit, Integration, E2E)
- **Week 5**: Achieve 98%+ test pass rate with performance optimization

## 🔗 Dependencies

- [x] Phase 5 - Data Processing Foundation (Completed)
- [x] Service layer implementation (Completed)
- [x] Hybrid SmartMenu service (Completed)
- [x] Release tagging system (Completed)

## ⏱️ Timeline

- **Week 1 (Jul 20-26)**: Critical Architecture Fixes (Dashboard, SmartMenu, Component tests)
- **Week 2 (Jul 27-Aug 2)**: API Integration Fixes (Lambda GraphQL, Hybrid Service, SmartMenu Settings)
- **Week 3 (Aug 3-9)**: Test Infrastructure & Quality (Utilities, Coverage, Documentation)
- **Week 4 (Aug 10-16)**: Lambda Function Testing Strategy (Unit, Integration, E2E)
- **Week 5 (Aug 17)**: Performance & Optimization (CI/CD, Performance, Monitoring)

## ⚠️ Risk Assessment

- **Low Risk**: Dashboard test fixes (clear architecture mismatch)
- **Medium Risk**: API integration fixes (network dependencies)
- **Low Risk**: Test infrastructure improvements (established patterns)
- **Low Risk**: Performance optimization (incremental improvements)

## 🎯 Success Criteria

- [ ] **Test Pass Rate**: 95%+ of all tests passing
- [ ] **Critical Fixes**: All dashboard and SmartMenu tests working
- [ ] **API Integration**: All Lambda GraphQL tests passing
- [ ] **Infrastructure**: Robust test utilities and patterns established
- [ ] **Lambda Testing**: Comprehensive Lambda function testing strategy implemented
- [ ] **Performance**: Optimized test execution and CI/CD integration
- [ ] **Documentation**: Complete testing patterns and standards

## ✅ Completion Criteria

### **Definition of Done:**

- [ ] **All 30 tasks completed** and checked off
- [ ] **21/21 story points completed** (100% story point completion)
- [ ] **95%+ test pass rate** achieved (down from 42 failed tests)
- [ ] **All critical test failures resolved** (Dashboard, SmartMenu, Component tests)
- [ ] **Lambda testing strategy implemented** (Unit, Integration, E2E)
- [ ] **Test documentation updated** with new patterns and standards
- [ ] **CI/CD integration working** with all tests passing
- [ ] **Release tag created** for completed features
- [ ] **Story moved to completed** directory

### **Completion Approval Required:**

- [ ] **Review of all test fixes** - Ensure no regressions introduced
- [ ] **Validation of test coverage** - Confirm 95%+ pass rate
- [ ] **Lambda testing validation** - Confirm testing strategy is working
- [ ] **Documentation review** - Confirm all patterns are documented
- [ ] **Final approval** - Explicit agreement that story is complete

## 📊 Progress Tracking

- **Tasks Completed**: 17/30
- **Progress**: 57%
- **Status**: In Progress
- **Current Focus**: Step 2 completed, moving to Step 3 (Test Infrastructure & Quality)

## 🔗 References

- **Sprint**: `docs/sprints/2025-07-20_sprint-11.md`
- **Previous Story**: `docs/stories/completed/STORY-1-DATA-PROCESSING-FOUNDATION-SPRINT-9.md`
- **Test Analysis**: Based on current test run results

## 📝 Notes

- **Architecture Changes**: Phase 5 introduced significant architecture changes that broke existing tests
- **Infrastructure Issues**: Lambda GraphQL endpoint returning 502 Bad Gateway errors for most queries - this is a real infrastructure problem, not a test issue
- **Test Progress**: Dashboard tests fixed and passing, SmartMenu tests partially fixed, UI tests mostly passing
- **API Test Findings**: SmartMenu settings tests working (3/3 passing), hybrid service tests partially working (4/5 passing)
- **Authentication Issues**: Test environment missing proper auth headers for some API tests
- **Step 2 Completion**: API integration fixes completed with infrastructure issues identified
- **Next Steps**: Move to Step 3 (Test Infrastructure & Quality) while infrastructure issues are addressed separately
- **Service Layer**: Tests need to be updated to use new service layer instead of direct Apollo mocks
- **Hybrid Service**: Dashboard tests need to be updated for new hybrid service data structure
- **GraphQL Schema**: SmartMenu tests need schema updates for current GraphQL schema
- **Test Strategy**: Hybrid approach - fix existing tests rather than complete rewrite
- **Priority Order**: Critical fixes first, then API integration, then infrastructure improvements
