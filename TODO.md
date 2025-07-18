# Project TODOs

## Development Phases

### Phase 1: Rapid Prototyping & Design

**Goal**: Get working functionality and user experience

- **Navigation Redesign** - Implement new sidebar navigation based on shadcn UI patterns
  - Status: Planning Complete
  - Reference: `docs/active/NAVIGATION-REDESIGN-PLAN.md`

- **Refactor the UI/UX to the new approach**
  - Status: Pending

### Phase 2: Unit Test Foundation

**Goal**: Build comprehensive unit tests for stable functionality

- **Fix all Users page and related tests to match the current API and UI implementation**
  - Status: In Progress

### Phase 3: Integration Testing

**Goal**: Test component interactions and user flows

- **Add integration tests for new navigation system**
  - Status: Pending

### Phase 4: Storybook & Documentation

**Goal**: Create Storybook stories for core components (atoms/molecules only)

- **Create Storybook stories for new navigation components**
  - Status: Pending
  - Scope: Only atoms/molecules, not full page components

## Technical Debt

### High Priority

- **Remove all AWS Cognito SDK dependencies and related code from the project**
  - Status: Pending
  - Scope: package.json, lambda/metabase-proxy/package.json, api/, lambda/
  - Risk: High (breaking changes to auth system)
  - Time: 2-3 days
  - Impact: Reduces bundle size, removes unused dependencies

- **Fix the caching on Dashboard page**
  - Status: Pending
  - Issue: Only a portion of UI/UX elements are cached, should be entire page
  - Risk: Medium (caching logic changes)
  - Time: 1-2 days
  - Impact: Improves performance and user experience

- **Change the names on the routes for Metabase and Cognito users**
  - Status: Pending
  - Issue: Both currently using "users" route name
  - Risk: Medium (route changes affect navigation)
  - Time: 0.5-1 day
  - Impact: Eliminates route conflicts, improves clarity

### Medium Priority

- **Address React Router future flag warnings in tests**
  - Status: Pending
  - Warnings: `v7_startTransition`, `v7_relativeSplatPath`
  - Risk: Low (test-only changes)
  - Time: 0.5 day
  - Impact: Prepares for React Router v7 upgrade

- **Fix React Hook dependency warnings in tests**
  - Status: Pending
  - Issue: `act()` warnings in test components
  - Risk: Low (test-only changes)
  - Time: 1 day
  - Impact: Cleaner test output, better test reliability

- **Fix failing Storybook stories** (currently moved to `src/components/_temp_stories/`)
  - Status: Pending
  - Risk: Low (component documentation only)
  - Time: 2-3 days
  - Impact: Restores component documentation and accessibility testing
  - Stories to fix:
    - `QuarterlyMetricsTable.stories.tsx` - Accessibility violations in table structure
    - `ProtectedRoute.stories.tsx` - React Router context issues
    - `CacheStatus.stories.tsx` - Potential accessibility or component issues
    - `Layout.stories.tsx` - Navigation component issues
    - `MetricsCard.stories.tsx` - Component rendering issues
    - `TrendsChart.stories.tsx` - Chart component issues
    - `ResourceHeader.stories.tsx` - Header component issues

### Low Priority

- **Update development documentation**
  - Status: Pending
  - Risk: None (documentation only)
  - Time: 0.5 day
  - Impact: Better onboarding for future developers

- **Code cleanup and formatting**
  - Status: Pending
  - Risk: None (cosmetic changes)
  - Time: 1 day
  - Impact: Improved code readability and consistency

- **Performance optimization audit**
  - Status: Pending
  - Risk: Low (analysis and minor optimizations)
  - Time: 1-2 days
  - Impact: Better application performance

## Completed

- **Refactor: Centralize toast usage in a single utility (`src/lib/toast.ts`)**
  - Status: Completed
  - Note: Makes it easier to mock and update toast behavior

- **Fix CI/CD pipeline by moving failing Storybook stories**
  - Status: Completed
  - Note: Stories moved to `src/components/_temp_stories/` for future fixing

## Development Guidelines

- **Follow phased approach**: Prototype → Unit Tests → Integration Tests → Storybook
- **Focus Storybook on atoms/molecules only** for core UI components
- **Move fast, then polish** - Get functionality working before comprehensive testing
- **Use atomic design principles** for component architecture
