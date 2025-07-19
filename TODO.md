# Project TODOs

## Critical

### Fix the dashboard widgets query to use `db_widgetsList` with proper pagination

- **Definition**: Update the dashboard widgets query to use the correct `db_widgetsList` field with proper pagination instead of the non-existent `widgets` field.
- **Estimated Time**: 2-3 hours
- **Risk**: High
- **Impact**: High

### Fix the quarterly metrics query to return actual data

- **Definition**: Investigate and fix the quarterly metrics query that is currently returning empty results instead of actual data from the data warehouse.
- **Estimated Time**: 3-4 hours
- **Risk**: High
- **Impact**: High

### Fix the GraphQL error about missing `widgets` field in dashboard

- **Definition**: Resolve the GraphQL error about the missing `widgets` field in the dashboard query by updating the query to use the correct field structure.
- **Estimated Time**: 1-2 hours
- **Risk**: High
- **Impact**: High

## High

### Change cache management page to use standard toast

- **Definition**: Update the cache management page so that all user information is communicated using the standard toast notification system. This should be the approach for all user-facing information going forward.
- **Estimated Time**: 1-2 hours
- **Risk**: Medium
- **Impact**: High

### Remove all AWS Cognito SDK dependencies and related code

- **Definition**: Remove all AWS Cognito SDK dependencies and related code from the project, including package.json, lambda/metabase-proxy/package.json, and any code in api/ and lambda/ that uses the SDK.
- **Estimated Time**: 2-3 hours
- **Risk**: Medium
- **Impact**: Medium

### Fix the caching on Dashboard page

- **Definition**: Ensure the entire Dashboard page is cached, not just a portion of the UI/UX elements.
- **Estimated Time**: 2 hours
- **Risk**: Medium
- **Impact**: Medium

### Refactor the UI/UX to the new approach

- **Definition**: Refactor the UI/UX to match the new design and interaction patterns.
- **Estimated Time**: 4-6 hours
- **Risk**: Medium
- **Impact**: Medium

### Change the names on the routes for Metabase and Cognito users

- **Definition**: Update route names so that Metabase and Cognito users do not both use the route 'users'.
- **Estimated Time**: 1 hour
- **Risk**: Low
- **Impact**: Medium

### Fix all Users page and related tests to match the current API and UI implementation

- **Definition**: Update the Users page and related tests to match the current API and UI implementation, including toast mocking and API route expectations.
- **Estimated Time**: 2 hours
- **Risk**: Medium
- **Impact**: Medium

## Medium

### Fix highlightColor field typo and usage

- **Definition**: Correct the typo in the database column (`higlight_color` to `highlight_color`), update all related backend and frontend code to use the correct field, and ensure the field is used consistently or removed if not needed.
- **Estimated Time**: 2-3 hours
- **Risk**: Low
- **Impact**: Low

### Address React Router future flag warnings in tests

- **Definition**: Fix React Router future flag warnings in tests: `v7_startTransition`, `v7_relativeSplatPath`
- **Estimated Time**: 0.5 day
- **Risk**: Low
- **Impact**: Low

### Fix React Hook dependency warnings in tests

- **Definition**: Fix `act()` warnings in test components
- **Estimated Time**: 1 day
- **Risk**: Low
- **Impact**: Low

### Fix failing Storybook stories

- **Definition**: Fix failing Storybook stories (currently moved to `src/components/_temp_stories/`)
- **Estimated Time**: 2-3 days
- **Risk**: Low
- **Impact**: Low

## Low

### Update development documentation

- **Definition**: Update development documentation for better onboarding
- **Estimated Time**: 0.5 day
- **Risk**: None
- **Impact**: Low

### Code cleanup and formatting

- **Definition**: General code cleanup and formatting improvements
- **Estimated Time**: 1 day
- **Risk**: None
- **Impact**: Low

### Performance optimization audit

- **Definition**: Conduct performance optimization audit
- **Estimated Time**: 1-2 days
- **Risk**: Low
- **Impact**: Low

## Completed

### Refactor: Centralize toast usage in a single utility (`src/lib/toast.ts`)

- **Definition**: Centralize toast usage in a single utility and update all app code and tests to use this utility instead of referencing `react-hot-toast` directly.
- **Estimated Time**: 1 hour
- **Risk**: Low
- **Impact**: Medium
- **Note**: This makes it easier to mock and update toast behavior in the future.

### Fix CI/CD pipeline by moving failing Storybook stories

- **Definition**: Move failing Storybook stories to `src/components/_temp_stories/` for future fixing
- **Estimated Time**: 0.5 hour
- **Risk**: None
- **Impact**: Low
