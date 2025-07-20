# Query Lifecycle Management Guide

## Overview

This document outlines the standardized process for adding new comprehensive queries, naming conventions, and retiring old queries when they're replaced by more comprehensive versions.

## 1. Query Naming Conventions

### New Comprehensive Queries

- **Format**: `{DOMAIN}_SETTINGS` or `{DOMAIN}_COMPREHENSIVE`
- **Examples**:
  - `SMARTMENU_SETTINGS` (replaces dashboard + analytics queries)
  - `USER_COMPREHENSIVE` (replaces user + profile queries)
  - `ANALYTICS_COMPREHENSIVE` (replaces trends + insights queries)

### Legacy Query Names

- **Format**: `{DOMAIN}_{SPECIFIC_FUNCTION}`
- **Examples**:
  - `DASHBOARD_WIDGET_METRICS`
  - `WIDGETS_QUARTERLY_TRENDS`
  - `WIDGETS_FEATURE_ADOPTION`

### Hook Naming Conventions

- **New Service-Based Hooks**: `use{Domain}Dashboard` or `use{Domain}Service`
- **Legacy Direct Apollo Hooks**: `use{Domain}Lambda`
- **Examples**:
  - `useSmartMenuDashboard` (new service-based)
  - `useDashboardLambda` (old direct Apollo)

## 2. File Structure and Organization

### Query Files

```
src/features/{domain}/graphql/lambda/queries/
├── {domain}-settings.ts          # New comprehensive query
├── {domain}-comprehensive.ts     # Alternative comprehensive naming
├── dashboard.ts                  # Legacy dashboard queries (KEEP UNTIL VALIDATED)
├── analytics.ts                  # Legacy analytics queries (KEEP UNTIL VALIDATED)
└── trends.ts                     # Legacy trends queries (KEEP UNTIL VALIDATED)
```

### Service Files

```
src/services/{domain}/
├── {Domain}SettingsService.ts    # New comprehensive service
├── {Domain}Service.ts            # Legacy service (KEEP UNTIL VALIDATED)
└── index.ts                      # Service exports
```

### Hook Files

```
src/features/{domain}/hooks/lambda/
├── use{Domain}Dashboard.ts       # New service-based hook
├── use{Domain}Lambda.ts          # Legacy direct Apollo hook (KEEP UNTIL VALIDATED)
└── index.ts                      # Hook exports
```

## 3. Adding a New Comprehensive Query

### Step 1: Create the Comprehensive Query (Parallel Implementation)

```typescript
// src/features/smartMenus/graphql/lambda/queries/smartmenu-settings.ts
export const SMARTMENU_SETTINGS = gql`
  query GetSmartMenuSettings {
    db_widgetsList {
      items {
        # Combine all fields from multiple legacy queries
        id
        name
        slug
        # ... all dashboard fields
        # ... all analytics fields
        # ... all settings fields
      }
    }
    quarterlyMetrics {
      # ... quarterly data
    }
  }
`;
```

### Step 2: Create the Service (Parallel Implementation)

```typescript
// src/services/smartmenus/SmartMenuSettingsService.ts
export class SmartMenuSettingsService extends DataService<SmartMenuSettings> {
  // Comprehensive service methods
  async getSmartMenuSettings(): Promise<
    BusinessLogicResult<SmartMenuSettings[]>
  > {
    // Implementation using the comprehensive query
  }
}
```

### Step 3: Create the Hook (Parallel Implementation)

```typescript
// src/features/smartMenus/hooks/lambda/useSmartMenuDashboard.ts
export function useSmartMenuDashboard() {
  const { smartMenus, loading, error, metrics } = useSmartMenuSettings();
  // Transform data for dashboard consumption
  return { widgets: smartMenus, metrics, loading, error };
}
```

### Step 4: Update Index Files (Keep Both)

```typescript
// src/features/smartMenus/hooks/lambda/index.ts
export { useSmartMenuDashboard } from "./useSmartMenuDashboard";
// KEEP LEGACY EXPORTS UNTIL NEW QUERY IS FULLY VALIDATED
export { useDashboardLambda } from "./useDashboardLambda";
```

## 4. Migration Process (SAFE PARALLEL APPROACH)

### Phase 1: Parallel Implementation ✅

- ✅ Create new comprehensive query (alongside existing)
- ✅ Create new service (alongside existing)
- ✅ Create new hook (alongside existing)
- ✅ Update index exports (keep both)
- ✅ **DO NOT** update frontend components yet
- ✅ **KEEP ALL EXISTING INFRASTRUCTURE INTACT**

### Phase 2: Testing and Validation 🔄

- 🔄 Test new service with real data
- 🔄 Verify caching works correctly
- 🔄 Compare results with legacy queries
- 🔄 Update tests to use new hook structure
- 🔄 **KEEP LEGACY INFRASTRUCTURE RUNNING**

### Phase 3: Frontend Migration (Simple Switch)

- 📋 Update components to use new hook (simple import change)
- 📋 Remove legacy hook imports from components
- 📋 Update component tests
- 📋 **LEGACY INFRASTRUCTURE STILL EXISTS FOR ROLLBACK**

### Phase 4: Complete Retirement (After Full Validation)

- 📋 **VALIDATE NEW QUERY IS WORKING PERFECTLY**
- 📋 Remove legacy query files completely
- 📋 Remove legacy service files completely
- 📋 Remove legacy hook files completely
- 📋 Remove legacy imports and exports
- 📋 Update all documentation
- 📋 **COMPLETE CODE CLEANUP - NO LEGACY CODE REMAINS**

## 5. Query Retirement Process (SAFE APPROACH)

### Step 1: Mark as Deprecated (After New Query is Working)

```typescript
// Add deprecation comments ONLY after new query is validated
/**
 * @deprecated Use SMARTMENU_SETTINGS instead
 * This query will be removed in the next major version
 * Legacy infrastructure kept for rollback capability
 */
export const DASHBOARD_WIDGET_METRICS = gql`...`;
```

### Step 2: Update Documentation

- Add deprecation notices to README files
- Update migration guides
- Document breaking changes
- **KEEP LEGACY DOCUMENTATION FOR REFERENCE**

### Step 3: Remove from Index Files (After Frontend Migration)

```typescript
// src/features/smartMenus/hooks/lambda/index.ts
// Remove deprecated exports ONLY after frontend is migrated
// export { useDashboardLambda } from "./useDashboardLambda"; // REMOVED
export { useSmartMenuDashboard } from "./useSmartMenuDashboard";
```

### Step 4: Delete Files (Only After Full Validation)

```bash
# Remove deprecated files ONLY after everything is working
rm src/features/smartMenus/graphql/lambda/queries/dashboard.ts
rm src/features/smartMenus/hooks/lambda/useDashboardLambda.ts
rm src/services/smartmenus/DashboardService.ts
```

## 6. Current Status Tracking

### ✅ Completed Migrations

- `SMARTMENU_SETTINGS` query created (parallel to existing queries)
- `useSmartMenuDashboard` hook created (parallel to existing `useDashboardLambda`)
- **EXISTING DASHBOARD INFRASTRUCTURE LEFT UNTOUCHED**

### 🔄 In Progress

- Testing new service with real data
- Validating caching performance
- **LEGACY INFRASTRUCTURE STILL ACTIVE**

### 📋 Pending Migrations

- Frontend component updates (simple import change)
- Legacy infrastructure cleanup (after validation)

## 7. Best Practices (SAFE APPROACH)

### Query Design

- **Comprehensive**: Include all related fields in one query
- **Efficient**: Minimize over-fetching while being comprehensive
- **Cached**: All queries should use service layer with caching
- **Typed**: Full TypeScript interfaces for all data structures
- **Parallel**: Build alongside existing queries, don't replace until validated

### Service Design

- **Domain-Specific**: One service per major domain
- **Cached**: All methods use `executeQuery` with caching
- **Filtered**: Support filtering and search capabilities
- **Metrics**: Include performance metrics and cache hit rates
- **Parallel**: Keep legacy services until new ones are proven

### Hook Design

- **Service-Based**: Use service layer, not direct Apollo calls
- **Transformed**: Transform service data for component consumption
- **Typed**: Full TypeScript interfaces for return values
- **Error-Handled**: Proper error handling and loading states
- **Parallel**: Keep legacy hooks until new ones are validated

### Testing Strategy

- **Service Tests**: Test service methods with mocked data
- **Hook Tests**: Test hooks with mocked services
- **Integration Tests**: Test full data flow from query to component
- **Cache Tests**: Verify caching behavior and performance
- **Comparison Tests**: Compare new vs legacy query results

## 8. Migration Checklist Template (SAFE APPROACH)

### For Each New Comprehensive Query:

#### Phase 1: Parallel Implementation

- [ ] Create comprehensive query file (alongside existing)
- [ ] Create comprehensive service file (alongside existing)
- [ ] Create comprehensive hook file (alongside existing)
- [ ] Update index exports (keep both)
- [ ] Add TypeScript interfaces
- [ ] **KEEP ALL EXISTING INFRASTRUCTURE**

#### Phase 2: Testing and Validation

- [ ] Write service tests
- [ ] Write hook tests
- [ ] Test with real data
- [ ] Verify caching works
- [ ] Compare results with legacy queries
- [ ] **LEGACY INFRASTRUCTURE STILL ACTIVE**

#### Phase 3: Frontend Migration (Simple Switch)

- [ ] Update components to use new hook (import change only)
- [ ] Remove legacy hook imports from components
- [ ] Update component tests
- [ ] **LEGACY INFRASTRUCTURE AVAILABLE FOR ROLLBACK**

#### Phase 4: Complete Retirement (After Full Validation)

- [ ] **VALIDATE NEW QUERY IS WORKING PERFECTLY**
- [ ] Mark legacy queries as deprecated
- [ ] Remove legacy query files completely
- [ ] Remove legacy service files completely
- [ ] Remove legacy hook files completely
- [ ] Remove legacy imports and exports
- [ ] Update all references
- [ ] Update documentation
- [ ] **COMPLETE CODE CLEANUP - NO LEGACY CODE REMAINS**

## 9. Example: SmartMenu Settings Migration (Current Status)

### Current State (Parallel Implementation)

```typescript
// BOTH EXIST SIMULTANEOUSLY - EXISTING INFRASTRUCTURE UNTOUCHED
// Legacy (still active and unchanged)
DASHBOARD_WIDGET_METRICS;
useDashboardLambda();

// New (being tested alongside existing)
SMARTMENU_SETTINGS;
useSmartMenuDashboard();

// Frontend still uses legacy (until we switch it)
import { useDashboardLambda } from "../features/dashboard/hooks/lambda";

// When ready to switch (simple import change):
// import { useSmartMenuDashboard } from "../features/dashboard/hooks/lambda";
```

### After Frontend Migration (Simple Switch)

```typescript
// Frontend changes to use new hook
import { useSmartMenuDashboard } from "../features/dashboard/hooks/lambda";

// Legacy infrastructure still exists for rollback
// DASHBOARD_WIDGET_METRICS still available
// useDashboardLambda still available
```

### After Complete Retirement (Full Cleanup)

```typescript
// COMPLETE LEGACY INFRASTRUCTURE REMOVAL
// DASHBOARD_WIDGET_METRICS - DELETED
// useDashboardLambda - DELETED
// DashboardService - DELETED
// All legacy imports - REMOVED
// All legacy exports - REMOVED
// Only SMARTMENU_SETTINGS and useSmartMenuDashboard remain
// CLEAN CODEBASE WITH NO LEGACY CODE
```

## 10. Complete Retirement Process

### When to Retire Legacy Code

- ✅ New comprehensive query is working perfectly
- ✅ All tests are passing
- ✅ Performance is validated
- ✅ Caching is working correctly
- ✅ Frontend migration is complete
- ✅ No issues reported in production

### Retirement Checklist

```bash
# 1. Remove legacy query files
rm src/features/smartMenus/graphql/lambda/queries/dashboard.ts
rm src/features/smartMenus/graphql/lambda/queries/analytics.ts
rm src/features/smartMenus/graphql/lambda/queries/trends.ts

# 2. Remove legacy service files
rm src/services/smartmenus/DashboardService.ts
rm src/services/smartmenus/AnalyticsService.ts
rm src/services/smartmenus/TrendsService.ts

# 3. Remove legacy hook files
rm src/features/smartMenus/hooks/lambda/useDashboardLambda.ts
rm src/features/smartMenus/hooks/lambda/useQuarterlyMetricsLambda.ts
rm src/features/smartMenus/hooks/lambda/usePlayerAnalyticsLambda.ts

# 4. Update index files to remove legacy exports
# 5. Remove legacy imports from all components
# 6. Update documentation
# 7. Run full test suite
# 8. Deploy and monitor
```

### Post-Retirement Validation

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Application builds successfully
- [ ] All functionality works as expected
- [ ] Performance is maintained or improved
- [ ] No legacy code references remain

## 11. Rollback Strategy (During Migration Phase)

If issues are discovered with the new comprehensive query **before retirement**:

1. **Immediate Rollback**: Change frontend imports back to legacy hooks
2. **Investigation**: Debug issues with new query/service
3. **Fix**: Resolve issues while legacy infrastructure is still available
4. **Re-test**: Validate fixes with real data
5. **Re-migrate**: Switch frontend back to new hooks

This approach ensures zero downtime and minimal risk during migrations.

**Note**: Once legacy code is retired, rollback requires re-implementing the legacy infrastructure.
