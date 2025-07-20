# Project TODOs

## Critical

### Refactor development style guide after each project

- **Definition**: Review and update the development style guide after completing each major project to ensure it reflects current best practices, lessons learned, and actual working patterns. This includes updating naming conventions, workflows, and any new patterns discovered during development.
- **Estimated Time**: 1-2 hours
- **Risk**: Low
- **Impact**: High
- **Note**: Ensures the style guide stays in sync with actual development practices and prevents drift between documented standards and real implementation.

### Fix test coverage for Apollo client changes

- **Definition**: Update and fix tests that are broken due to Apollo client renaming and architecture changes. Tests are failing because they expect old API data but get Lambda data, and SmartMenus tests need to use the renamed `apiGraphQLClient`.
- **Estimated Time**: 2-3 hours
- **Risk**: Medium
- **Impact**: High
- **Note**: 27 failed tests out of 303 total. Dashboard tests need Lambda mocks, SmartMenus tests need updated client references, type mismatches between old API and Lambda schemas.

### Add comprehensive caching system tests

- **Definition**: Create comprehensive test suite for the new service-level caching with operation granularity. This includes testing cache utilities, localStorage cache layer, Apollo cache synchronization, TTL expiration, and cache management functions.
- **Estimated Time**: 4-6 hours
- **Risk**: Medium
- **Impact**: High
- **Test Categories**:
  - **Cache Utilities**: Test `smartRefresh()`, `clearServiceCache()`, `clearOperationCache()`, `getCacheStatus()`
  - **localStorage Cache**: Test TTL-based storage, cache expiration, storage limits
  - **Apollo Integration**: Test cache synchronization, fetch policies, type policies
  - **Operation TTLs**: Test individual operation cache expiration, service-level organization
  - **Cache Performance**: Test cache hit/miss rates, storage usage monitoring
  - **Error Handling**: Test cache failures, localStorage errors, Apollo cache conflicts
- **Note**: Critical for ensuring caching reliability and performance. Should include unit tests, integration tests, and end-to-end cache scenarios.

### Add progress indicators for cache operations

- **Definition**: Implement progress bars and loading states for cache operations that can take 5-10 seconds (refresh all, clear all, service group operations). This includes visual feedback during long-running cache operations.
- **Estimated Time**: 2-3 hours
- **Risk**: Low
- **Impact**: High
- **Features**:
  - **Progress Bar**: Show progress for multi-step cache operations
  - **Loading States**: Disable buttons and show loading spinners during operations
  - **Operation Status**: Real-time updates on which operations are being processed
  - **Timeout Handling**: Graceful handling of operations that take too long
  - **Cancel Option**: Allow users to cancel long-running operations
- **Implementation**:
  - Add progress tracking to cache utility functions
  - Create reusable progress bar component
  - Update cache management UI to show operation progress
  - Add operation timeout and retry logic
- **Note**: Essential UX improvement for cache operations that can take 5-10 seconds. Users need visual feedback to understand the system is working.

### Implement scheduled cache refresh functionality

- **Definition**: Implement actual scheduled cache refresh functionality that works independently of the browser/app being open. Currently the scheduled refresh is only display/UI - it doesn't actually refresh caches.
- **Status**: Deferred - Needs architectural decision
- **Estimated Time**: 4-6 hours
- **Risk**: Medium
- **Impact**: High
- **Deferred Reason**: Need to evaluate architectural approach and implementation strategy
- **Implementation Options**:
  - **AWS Lambda + EventBridge**: Create Lambda function triggered by EventBridge cron rule (recommended)
  - **Server-side Cron Job**: Traditional cron job on server/container
  - **Client-side Scheduling**: Browser-based scheduling (only works when app is open)
- **Features**:
  - **Lambda Function**: Cache refresh function that clears and repopulates all caches
  - **EventBridge Rule**: CloudFormation template for scheduled execution
  - **Configuration Sync**: Lambda reads cache config from database/environment
  - **Error Handling**: Retry logic, logging, and failure notifications
  - **Timezone Support**: Respect configured timezone for refresh timing
- **AWS Implementation**:
  - Create `lambda/cache-refresh/` function
  - Add EventBridge rule with cron expression
  - Configure IAM permissions for cache operations
  - Add CloudWatch logging and monitoring
- **Note**: Critical for ensuring caches are refreshed automatically without manual intervention. Currently users must manually refresh caches. **Deferred until architectural approach is decided.**

### Revert Apollo client code back to working version

- **Definition**: Revert the Apollo client configuration and caching logic back to the version that was working correctly before recent changes. The current version is serving stale cached data causing dashboard metrics to show 0 values.
- **Estimated Time**: 1-2 hours
- **Risk**: High
- **Impact**: High
- **Note**: Current logs show Apollo cache serving stale data with wrong structure, causing SmartMenus metrics to display 0 values.

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

### Configure ESLint to not have issues with JS files

- **Definition**: Configure ESLint to properly handle JavaScript files without generating errors or warnings. This includes updating ESLint configuration to exclude JS files from TypeScript-specific rules and ensure proper linting for mixed JS/TS codebases.
- **Estimated Time**: 1-2 hours
- **Risk**: Low
- **Impact**: Medium
- **Tasks**:
  - **Update ESLint config**: Modify `.eslintrc.json` to properly handle JS files
  - **Add JS file patterns**: Configure overrides for different file types
  - **Fix TypeScript rules**: Ensure TS rules don't apply to JS files
  - **Test configuration**: Verify ESLint runs cleanly on all file types
- **Note**: Currently ESLint may be applying TypeScript rules to JavaScript files, causing unnecessary errors.

### Configure ESLint for Node.js Lambda files

- **Definition**: Configure ESLint to properly handle Node.js Lambda files in the `lambda/` directory without generating errors for Node.js-specific globals like `console`, `require`, `module`, etc.
- **Estimated Time**: 1 hour
- **Risk**: Low
- **Impact**: Medium
- **Tasks**:
  - **Add Lambda-specific ESLint config**: Create `.eslintrc.js` in `lambda/` directory
  - **Configure Node.js environment**: Set `env: { node: true }` for Lambda files
  - **Add Lambda file patterns**: Configure overrides for `lambda/**/*.js` files
  - **Test configuration**: Verify ESLint runs cleanly on Lambda files
- **Note**: Currently ESLint is treating Lambda files as browser files, causing errors for Node.js globals like `console`, `require`, `module`.

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

- **Definition**: Fix `act()`

### Clean up and reorganize docs directory structure

### Refactor CacheManagement.tsx

- **Definition**: Refactor the CacheManagement page to improve maintainability, performance, and user experience. The current implementation has grown complex and needs restructuring.
- **Estimated Time**: 3-4 hours
- **Risk**: Medium
- **Impact**: High
- **Refactoring Areas**:
  - **Component Structure**: Break down the large component into smaller, focused components
  - **State Management**: Simplify state management and reduce prop drilling
  - **Performance**: Optimize re-renders and improve loading states
  - **Code Organization**: Separate concerns and improve readability
  - **Error Handling**: Improve error handling and user feedback
- **Specific Tasks**:
  - **Extract Service Group Components**: Create separate components for each service group
  - **Optimize Cache Status Updates**: Reduce unnecessary re-renders during status updates
  - **Improve Loading States**: Add better loading indicators for cache operations
  - **Simplify Event Handlers**: Consolidate and simplify cache operation handlers
  - **Add Error Boundaries**: Implement proper error boundaries for cache operations
  - **Improve Type Safety**: Add better TypeScript types and interfaces
  - **Extract Custom Hooks**: Create custom hooks for cache management logic
- **Benefits**:
  - **Maintainability**: Easier to maintain and extend
  - **Performance**: Better performance with optimized re-renders
  - **User Experience**: Improved loading states and error handling
  - **Code Quality**: Cleaner, more readable code structure
- **Note**: This refactor should be done after the cache contents viewer is fully tested and working.

### Setup Vibe Coder Extension

- **Definition**: Configure Vibe Coder extension in Cursor for voice-to-code functionality with proper API key settings and workspace permissions.
- **Estimated Time**: 1-2 hours
- **Risk**: Low
- **Impact**: Medium
- **Tasks**:
  - **Fix Cursor Permissions**: Run Cursor with elevated permissions (Mac: `sudo open /Applications/Cursor.app`)
  - **Configure API Key**: Set up Deepgram API key in Vibe Coder settings (format: `dg.` prefix, no spaces)
  - **Workspace Settings**: Ensure `.vscode/` or `.cursor/` settings files are writable
  - **Test Functionality**: Verify voice-to-code works correctly
  - **Document Setup**: Create setup guide for team
- **Troubleshooting**:
  - **Missing "Save" Permission**: Run Cursor as admin (Windows) or with elevated permissions (Mac)
  - **Improper API Key Format**: Ensure Deepgram API keys start with `dg.` and have no spaces
  - **Settings File Not Writable**: Check `.vscode/` or `.cursor/` settings files are not read-only
  - **Wrong Save Button**: Use "Save" button next to API field, not global settings save
- **Note**: Vibe Coder requires proper permissions and API key configuration to function correctly.

- **Definition**: Review, clean up, and reorganize the docs directory to improve structure and remove outdated documents. The current docs directory has grown significantly and needs better organization.
- **Estimated Time**: 2-3 hours
- **Risk**: Low
- **Impact**: Medium
- **Tasks**:
  - **Audit existing docs**: Review all files in docs/ to identify what's current vs outdated
  - **Archive old documents**: Move outdated docs to docs/\_archive/ or remove if no longer relevant
  - **Reorganize structure**: Improve the directory structure for better navigation
  - **Update references**: Ensure all cross-references between docs are accurate
  - **Consolidate duplicates**: Merge or remove duplicate information
  - **Create index**: Add a main index or navigation document
- **Categories to review**:
  - **Sprint documents**: Keep current sprints, archive old ones
  - **Architecture docs**: Update or archive based on current implementation
  - **Setup guides**: Ensure they reflect current project state
  - **Style guides**: Consolidate and update with current practices
  - **API documentation**: Update or remove outdated API docs
- **Note**: This will improve maintainability and make it easier to find relevant documentation.
