# Sprint 1 Plan — 14 Jun → 21 Jun 2025

This internal plan tracks **tactical tasks** for the current sprint. Public-facing roadmap lives in `docs/active/PROJECT-PLAN.MD`.

---

## Sprint Goal
Lay the technical foundations: authentication, stability tooling (error boundary, logger, lint hooks), and CI pipeline.

## Backlog & Checklist

### 1. Authentication (`feat/auth`)
- [x] Disable self-service sign-up in Cognito
- [x] Scaffold React Router pages: **Login**, **Register** _(ForgotPassword pending)_
- [x] Add typography styles
- [x] JWT storage & refresh logic (Apollo auth link)
- [x] `<ProtectedRoute>` component
- [ ] Hook up UI to EveryBite GraphQL mutations _(moved to Sprint 3)_
- [ ] Basic form validation & error states _(moved to Sprint 3)_

### 2. Global Error Boundary (`feat/error-boundary`)
- [x] Reusable `<ErrorBoundary>` wrapper
- [x] Toast / fallback UI

### 3. Centralized Logger (`feat/logger`)
- [x] Console + remote transport respecting `VITE_LOG_LEVEL`
- [ ] Replace remaining `console.*` with logger _(ongoing—carry-over)_

### 4. Dev-Ex: Husky & lint-staged (`feat/husky-lint`)
- [x] Pre-commit prettier + eslint
- [ ] Commit msg linting (Conventional Commits) _(carry-over)_

### 5. CI Pipeline
- [x] GitHub Actions: install, lint, test, build
- [ ] Docker image build & push (staging) _(carry-over)_

### 6. Documentation & Demo _(deferred to Sprint 3)_
- [ ] Update README with setup instructions _(carry-over)_
- [ ] Loom walkthrough of sprint deliverables _(carry-over)_

## Definition of Done
1. All tasks checked off
2. Feature branches squash-merged to `develop` with PR review
3. CI green on `develop`
4. Local & staging smoke tests pass

---
_Last updated: 2025-06-16 — Sprint goal met; remaining items moved to Sprint 3_  
_Checked off completed items_
