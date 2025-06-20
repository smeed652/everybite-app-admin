# Testing Strategy (v0)

_Last updated: 2025-06-19_

This document describes the first-pass automated testing approach for the **EveryBite SmartMenu Admin** application.  The goal is to get fast, meaningful feedback on business logic, routing, and authentication while allowing UI/UX to evolve.

---

## 1. Principles

1. **Test Pyramid** – many unit tests, fewer integration tests, a handful of E2E smoke flows.
2. **Resilient Selectors** – prefer roles, labels or `data-testid`, never style-class selectors.
3. **Mock Boundaries** – mock GraphQL calls and Cognito in unit/integration layers; hit real API only in E2E staging.
4. **Incremental Coverage** – start with 70 % line / branch coverage and raise the bar every milestone.

---

## 2. Tooling Options

| Layer | Current Choice | Alt. Choice | Rationale |
|-------|----------------|-------------|-----------|
| Unit / Integration | **Jest** + React Testing Library | **Vitest** + RTL | Jest ships with CRA; mature ecosystem, zero migration cost. Vitest offers faster cold starts, ESM support, and a Vite-native dev server but would require either (a) dual build systems or (b) migrating CRA → Vite. |
| Mocking Network | **MSW** | n/a | Works with both Jest & Vitest. |
| E2E | **Cypress** | Playwright | Cypress already familiar & easy CI setup. |


### 2.1 Should we switch to Vitest **now**?

Pros:
* ~2-3× faster test startup & watch mode.
* Native ESM & TypeScript without Babel.
* Same syntax as Jest – minimal test-file changes.

Cons:
* Best with a Vite build; our CRA project uses Webpack. Mixing can work but duplicates config & dev dependencies.
* Adds build complexity while the product surface is still shifting.
* CI minutes saved are small at current test count.

**Recommendation:** stay on Jest for v0. Re-evaluate **after** either:
1. We plan to migrate the entire app to Vite, **or**
2. The test suite grows large enough (>300 tests) that Jest's speed becomes a bottleneck.

---

## 3. Coverage Targets (Phase-1)

| Layer | What to Cover | Examples |
|-------|---------------|----------|
| Unit | Pure logic & UI components | `useWidget` hook, `ProtectedRoute`, `SmartMenuHeader` states |
| Integration | Component + providers + router | Auth redirect flow, SmartMenuDetail editing/saving |
| E2E Smoke | Happy path user journeys | Sign-in → SmartMenu list → Detail → Preview, Non-admin 403 |


---

## 4. Folder & Naming Convention

```
src/
  components/Button.test.tsx      (unit)
  features/smartMenus/__tests__/
    SmartMenuHeader.test.tsx      (unit)
__tests__/integration/
  auth-routing.test.tsx           (integration)
cypress/e2e/
  smoke_smartmenu.cy.ts           (E2E)
```

---

## 5. CI Integration

* `npm run test:ci` – Jest with coverage.
* `npm run cypress:ci` – Cypress headless.
* GitHub Actions workflow fails on any failing test or coverage < 70 %.

---

## 6. Next Steps

1. Verify `jest`, `@testing-library/*`, `msw`, `cypress` in `package.json`.
2. Scaffold:
   * `ProtectedRoute` unit tests
   * `SmartMenuHeader` render tests
   * Auth routing integration test
   * Cypress smoke flow
3. Add `data-testid` where necessary to stabilise selectors.
4. Incrementally raise coverage thresholds each sprint.

---

> This document is expected to evolve. Please add comments or open PRs as testing requirements change.
