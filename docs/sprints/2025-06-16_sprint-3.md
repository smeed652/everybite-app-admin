# Sprint 3 – 2025-06-17 → 2025-06-30

> Duration: **2 weeks**  
> Theme: **Stabilise CI & ship first production-ready admin features**

## Sprint Goal
1. Achieve 100 % green CI (lint, type-check, unit, e2e).  
2. Deliver baseline admin capabilities: role-based access, invite flow, SmartMenu configuration CRUD.  
3. Lay foundations for analytics & notifications.

## Ranked Task List

### Priority 1 – Must-Have
| # | Task | Owner | Acceptance Criteria |
|---|------|-------|---------------------|
|1|**CI stabilisation** – ensure GH Actions passes on every PR|DevOps|All jobs green on default & feature branches|
|2|**Role & permission guard** – Admin vs Manager UI routes|Frontend|Unauthorised role gets 403 page & blocked API calls|
|3|**Invite user e2e** – integrate Cognito email invite, convert temp pwd|Backend/FE|Cypress test: invite → first-login → new pwd succeeds|
|4|**Global layout (nav, header, footer) using shadcn/ui**|Frontend|Responsive navbar with routes, sticky header, footer; dark/light ready|
|5|**Pagination & search on Users page**|Frontend|Server pagination (GraphQL) & client search tested|

### Priority 2 – Should-Have
| # | Task | Notes |
|---|------|-------|
|5|Dashboard graphs (orders, click-through) using EveryBite GraphQL|Use Apollo + recharts|
|6|SmartMenu widget CRUD UI|Create/Edit/Delete widgets per location|
|7|Unit-test coverage ≥ 70 %|Jest threshold gate in CI|

### Priority 3 – Could-Have
| # | Task | Notes |
|---|------|-------|
|8|Notification service (toast + email templates)|Queue emails via SES|
|9|WCAG AA accessibility audit & fixes|Use axe-core script|
|10|Developer docs pass #1|README, architecture diagram|

## Stretch / Icebox
* Gantt chart component for project timelines.  
* Real-time collaboration (WebSocket channel).

## Milestones & Dates
- **M1** (Jun 21): CI green, role guard merged.  
- **M2** (Jun 26): Invite flow, Users pagination live.  
- **M3** (Jun 30): SmartMenu CRUD & dashboard charts deployed.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
|Cognito rate limits test account creation|Medium|Re-use seeded accounts, back-off retries|
|Analytics queries slow|High|Add API caching layer, lazy-load charts|

## Definition of Done
- Feature behind CI green.  
- Unit + e2e tests added/updated.  
- Docs updated.  
- Meets accessibility & security guidelines.
