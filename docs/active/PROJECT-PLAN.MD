# PROJECT ROADMAP

This roadmap communicates the high-level phases, milestones, and sprint goals for the SmartMenu Admin Panel. It is **public-facing** and should be kept concise. The internal `plan.md` remains our tactical sprint board.

---

## Phase Overview

| Phase | Goal                                                                    | Target Domain                           | Status      |
| ----- | ----------------------------------------------------------------------- | --------------------------------------- | ----------- |
| 1.0   | Project setup, CI/CD scaffold, code-gen, baseline docs                  | –                                       | ✅ complete |
| 1.1   | MVP for Customer Success: auth, dashboard, SmartMenu list/detail editor | `everybite-stage.com` → `everybite.com` | 🚧 current  |
| 1.2   | Role-based access, collaboration tools                                  | staging                                 | ⏳ queued   |
| 2.x   | Advanced analytics, notifications, mobile optimisations                 | staging/prod                            | 🔮 future   |

---

## Current Phase — 1.1 MVP

### Objectives

1. Secure login & JWT storage
2. Dashboard shell with key metrics
3. SmartMenu list page (table) & detail editor
4. Audit log view (read-only)
5. Responsive design & accessibility (WCAG 2.1 AA)
6. Unit + integration tests ≥ 80 % coverage

### Deliverables Checklist

- [ ] React + Vite + TS scaffold ✔️
- [ ] Tailwind & shadcn/ui setup ✔️
- [ ] Apollo Client configured with generated hooks ✔️
- [ ] Global ErrorBoundary & toast feedback
- [ ] Service layer (`src/services/`) abstraction
- [ ] Auth pages (login → dashboard redirect)
- [ ] Basic user management (invite, enable/disable, reset password, delete)
  - Implemented minimal UI; full shadcn DataTable + DropdownMenu deferred to future sprint
- [ ] SmartMenu list (query) + detail (mutation)
- [ ] Env-controlled logger (`VITE_LOG_LEVEL`)
- [ ] Husky + lint-staged pre-commit hooks
- [x] AWS Lambda functions for API proxying
- [ ] CI pipeline → AWS ( stage / prod )
- [ ] E2E smoke tests in staging

### Configuration

All runtime secrets live only in `.env.local` (never committed). The sample `.env.example` lists every key a developer must set.

| Env Key                    | Purpose                           | Example                             |
| -------------------------- | --------------------------------- | ----------------------------------- |
| VITE_GRAPHQL_URI           | SmartMenu GraphQL endpoint        | `https://api.everybite.com/graphql` |
| VITE_AWS_REGION            | AWS region used by Cognito        | `us-west-1`                         |
| VITE_COGNITO_USER_POOL_ID  | Cognito User-Pool id              | `us-west-1_XXXXXXX`                 |
| VITE_COGNITO_APP_CLIENT_ID | Cognito App-client id (no secret) | `abcd1234abcd1234abcd1234`          |
| EVERYBITE_API_KEY          | Service key for EveryBite API     | `sk_...`                            |
| VITE_LOG_LEVEL             | Browser log level                 | `info`                              |

_Last config update: 2025-06-14_

### Timeline (single dev)

| Week | Focus                                                |
| ---- | ---------------------------------------------------- |
| 1    | Scaffold repo, logger, error boundary, husky, Docker |
| 2    | Auth flow & dashboard shell                          |
| 3    | SmartMenu list + editor, tests                       |
| 4    | Polish, accessibility audit, deploy to staging       |
| 5    | Bug-fixes, deploy to prod                            |

> Dates are indicative; adjust as work progresses.

---

## Phase 1.2 Preview

• Role-based permissions (Admin, CS, Marketing)  
• Collaboration tools (comments, file sharing)  
• Notifications service (email + in-app)

---

## Process & Governance

• **Branching**: `main` (prod), `develop` (integrations), feature branches → squash merge.  
• **CI Checks**: lint, tests, build, Docker image, deploy to staging on merge to `develop`.  
• **Release**: manual promote `develop` → `main` (prod) once smoke tests pass.

---

_Last updated: 2025-06-13_
