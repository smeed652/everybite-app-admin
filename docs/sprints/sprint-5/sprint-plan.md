# Sprint 5 — SmartMenu Audit & Polish

*Start: 2025-06-20*
*End: 2025-06-27 (1-week sprint)*

## Objectives
1. Audit refactored SmartMenu panels (Features, Marketing, Basic) against production for 100 % functional and visual parity.
2. Close or log any regressions.
3. Raise automated coverage (unit, integration, E2E) for SmartMenu.
4. Complete remaining extraction / cleanup tasks from Sprint 4.
5. Maintain accessibility and performance standards.

---

## Ranked Task List

### 1 – SmartMenu Audit (skipped)
*(These steps became unnecessary after unifying dirty-state logic; team agreed to defer full audit to a later release)*
- [x] ~~Spin up production widget and local refactor side-by-side~~
- [x] ~~Verify each SettingToggle’s behaviour (enable/disable, diff emission)~~
- [x] ~~Validate Ordering URL builder (base + UTM)~~
- [x] ~~Confirm Build-Your-Own, Nutrients, Allergens flows~~
- [x] ~~Capture screenshots / notes for discrepancies~~
- [x] ~~Log GitHub issues (label `audit`) for each regression~~

### 2 – Regression Test Suite
- [ ] Unit: `SettingToggle` render + state transitions.
- [ ] Integration:
  - SmartMenu detail diff flow
  - Ordering URL logic
  - BYO / Nutrients paths
- [ ] Cypress E2E: user toggles settings and observes widget changes.

### 3 – Apollo Mock Expansion
- [ ] Add `banners` and `menuItems` sub-fields to mocked `Widget` factory.
- [ ] Adjust tests to satisfy new schema shape.

### 4 – Accessibility & UX Review
- [ ] Run `axe-core` against SmartMenu pages.
- [ ] Check keyboard navigation & ARIA (`role="switch"`).
- [ ] Fix WCAG issues that don’t require major redesign.

### 5 – Sprint 4 Carry-overs
- [ ] Extract shared components: `LabeledInput`, `TwoColGrid`, `InlineAction`.
- [ ] Add `CollapsibleSettingToggle` or extend base.
- [ ] Implement `applyIfChanged` util and refactor diff logic.

### 6 – Performance & Bundle Check
- [ ] Investigate >500 kB chunk warnings; evaluate manual chunking / `import()`.

### 7 – Documentation & Report
- [ ] Fill out `docs/audit/sprint5-smartmenu-audit.md` with findings.
- [ ] Summarise outcomes in `docs/audit/sprint5-report.md` for stakeholders.

---

## Definition of Done
- All audit items resolved or tracked as issues.
- CI green: unit, integration, E2E suites updated.
- Zero critical accessibility violations.
- Bundle-size warnings addressed or documented.
- Sprint report delivered.

---

## Outcomes & Achievements (Actual)
The team pivoted toward hardening the test suite ahead of Storybook work. Key wins:

- ✅ **Increased Code Coverage** – Raised overall line coverage to ~63 % (previously 53 %), including:
  - Apollo client factory unit tests.
  - SmartMenu custom hooks (`useSmartMenus`, `useToggleWidgetSync`).
  - Dashboard and Users page integration tests.
  - Auth flow, route guard, and logger utilities.
- ✅ **Removed Demo Storybook Files** – Cleaned `src/stories/*` scaffold to reduce noise before real stories.
- ✅ **CI Green** – All unit/integration tests pass (61 total).
- 🔄 **Deferred** SmartMenu audit and Cypress E2E to a later release based on stakeholder direction.

Sprint 5 concluded with a stronger safety net and cleaner codebase, positioning us to focus on Storybook and UI polish in Sprint 6.
