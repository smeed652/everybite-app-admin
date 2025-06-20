# Sprint 4 — 17 Jun 2025 → 01 Jul 2025

## Theme
Core UI scaffolding & GraphQL API integration (Phase 1.1 Customer Success)

## Sprint Goal
Deliver a functional Dashboard & SmartMenu list powered by EveryBite GraphQL, establishing the foundation for future feature work.

## Objectives (SMART)
1. GraphQL Client configured with JWT authentication and TypeScript codegen (⏱ day 1).
2. Shared layout & navigation shell (sidebar + topbar) in place (⏱ day 2).
3. Dashboard page shows key SmartMenu metrics from API (⏱ day 5).
4. SmartMenu List page with search / pagination backed by API (⏱ day 7).
5. Read-only SmartMenu Detail view (⏱ day 9).
6. Unit tests & Storybook coverage ≥ 70 % for new components (ongoing).

## Backlog & Task Breakdown
| Priority | Task | Owner | Est (pts) |
|----------|------|-------|-----------|
| ✅ P0 | Configure Apollo Client with auth link & env vars | Dev A | 2 |
| ✅ P0 | Setup GraphQL code generation (`graphql-codegen`) | Dev A | 1 |
| ✅ P0 | Global layout (Sidebar + Header) & React Router routes | Dev B | 3 |
| ✅ P1 | Dashboard metric queries + `<MetricCard>` comp | Dev B | 3 |
| P1 | SmartMenu list query + `<DataTable>` component | Dev C | 5 |
| ✅ P1 | `<ProtectedRoute>` guard using auth context | Dev A | 1 |
| P2 | SmartMenu Detail (read-only) page | Dev C | 3 |
| P2 | Global loading & error boundaries polish | Dev B | 2 |
| P2 | Local mock GraphQL server via MSW for offline dev | Dev C | 2 |
| P2 | Cypress smoke tests (Dashboard, List) | QA | 3 |
| P3 | Storybook stories for UI primitives | Dev D | 2 |
| P3 | Vitest unit tests for new modules | Dev D | 2 |
| P3 | Update README / docs for GraphQL & dev workflow | Dev D | 1 |

_Total committed capacity: 30 pts_

## Definition of Done
1. Dashboard & SmartMenu List load live data on staging.
2. All code merged via reviewed PRs; no `eslint` warnings.
3. CI (lint, tests, build) passes on all PRs and `develop`.
4. Documentation updated for new modules and setup.

---
*Previous sprint-4 draft archived below for reference.*



## Theme
Stabilise CI & expand test coverage while delivering the first "Menu Builder" MVP for SmartMenu Admin.

## Objectives (SMART)
1. **Green CI on every PR** — Cypress + Vitest must pass on GitHub Actions (⏱ day 1).
2. **Menu Builder MVP** — enable admins to create/update a menu with drag-and-drop sections & items (⏱ day 10).
3. **Type-safety debt payoff** — reduce `any` usages by 30 % in `src/` (⏱ day 7).
4. **Page-level loading states** — add skeleton loaders to Users & Menus pages to improve UX (⏱ day 5).
5. **Docs & DX** — publish CONTRIBUTING.md + VSCode launch config (⏱ day 3).

## Backlog & Task Breakdown
| Priority | Epic / Task | Owner | Est (pts) |
|----------|-------------|-------|-----------|
| P0 | Fix CI env (`CYPRESS_BASE_URL`, secret placement) | Sid | 1 |
| P0 | Add `wait-on` & health check to workflow | Sid | 1 |
| P0 | Merge Sprint-3 PR & cut `v0.4.0` tag | Sid | 1 |
| P1 | Menu Builder – data model (`Menu`, `Section`, `Item`) | Dev A | 3 |
| P1 | Menu Builder – drag-and-drop UI (react-beautiful-dnd) | Dev A | 5 |
| P1 | Menu Builder – API routes (`/api/menu/*`) with RBAC | Dev B | 5 |
| P1 | Menu Builder – e2e spec (`menu_builder.cy.ts`) | QA | 3 |
| P2 | Refactor Users page hooks → `react-query` | Dev C | 3 |
| P2 | Remove 40 occurrences of `any` (ts-eslint fix) | Dev C | 2 |
| P2 | Skeleton loaders component library entry | Dev D | 2 |
| P3 | CONTRIBUTING.md + Prettier/ESLint docs | Dev D | 1 |
| P3 | VSCode debug config (`.vscode/launch.json`) | Dev D | 1 |

_Total committed capacity: 28 pts_

## Carry-over From Sprint 3
- None; all Sprint 3 stories closed ✅

## Stretch Goals
- Dark-mode toggle in Settings page.
- GitHub OIDC deploy tokens to replace personal access token.

## Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Cognito rate limits during Menu Builder tests | Medium | Low | Use local mocks in Cypress |
| React-beautiful-dnd self-scroll bug | Low | Medium | Evaluate `dnd-kit` fallback |

## Definition of Done
1. CI pipeline green on `main` and PR branches.
2. All code merged via reviewed PRs; no `eslint` errors.
3. Docs updated; demo GIF attached to release notes.

---
### Progress — 18 Jun 2025
- BrandingPanel render loop fixed; colour & font updates emit correct mutation payloads.
- `useUpdateWidget` hook now builds mutation dynamically so response mirrors input fields.
- Apollo optimistic cache updates implemented for colour/name changes.
- CI pipeline green after Vercel dev + Cognito stub; all 7 Cypress specs passing.

_Updated: 18 Jun 2025 by Cascade._
