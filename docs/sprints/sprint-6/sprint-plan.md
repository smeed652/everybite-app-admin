# Sprint 6 — Storybook Foundation & UI Hardening

*Start: 2025-07-13*
*End: 2025-07-26 (2-week sprint)*

## Objectives
1. Stand-up Storybook with robust configuration (Controls, MSW, a11y, dark-mode).
2. Inventory every UI component and establish a coverage matrix (default, variant, error, loading).
3. Author high-value stories for core SmartMenu pages and shared UI components.
4. Introduce interaction tests and Chromatic visual regression in CI.
5. Address top accessibility and performance gaps discovered in Sprint 5 tests.

---

## Ranked Task List

### 1 – Tooling Setup & Mock Expansion
- [x] Expand Apollo/GraphQL mocks to include `banners`, `menuItems` fields (carry-over from Sprint 5).
- [x] **Install Storybook** (React + Vite) and peer deps.
- [x] Add essential addons: Controls, a11y, viewport, interactions, dark-mode, MSW.
- [x] Configure global decorators (Tailwind, Router, QueryProvider).
- [x] Wire MSW with default GraphQL mocks re-using existing test mock data.

### 2 – Component Inventory
- [x] Script/grep to list exports in `src/components`, `src/features/**/*/components`.
- [x] Tag each component: *Custom*, *shadcn*, *Headless UI*, *Radix*.
- [x] Produce **Story Coverage Matrix** (Default, Variants, Edge/Error, Loading, a11y).

### 3 – Write Stories
- [ ] SmartMenu pages: `Dashboard`, `SmartMenus`, `SmartMenuPage` widgets section.
- [x] Shared UI: `Card`, `Modal`, `Drawer`, `SettingToggle`, layout primitives.
- [x] Include Controls and MSW handlers for stateful components.
- [x] Add interaction tests via `@storybook/testing-library`.

### 4 – Visual Regression, E2E & CI
- [ ] (Back-burner) Add minimal Cypress smoke test: SmartMenu toggle flow — to re-enable full E2E suite later.
- [ ] Integrate Chromatic (or Percy) — snapshot PR check.
- [ ] Update GitHub Actions to build Storybook & run visual regression.

### 5 – Accessibility & Performance Polish
- [x] Run Storybook a11y addon; fix critical WCAG errors.
- [x] Resolve **all** Axe accessibility violations across components/stories (2025-07-14).
- [ ] Address >500 kB chunk warnings; evaluate dynamic `import()`.

### 6 – Documentation
- [ ] Update `CONTRIBUTING.md` with Storybook usage instructions.
- [ ] Add README section for writing stories, MSW, interactions.

### 7 – Automated Testing
- [ ] Add **Storybook play tests** for every story (covers primary interactions and asserts DOM state).
- [ ] Enable **Storybook Test-Runner** in CI to execute play tests and axe a11y rules.
- [ ] Create **unit tests** for new shared components (`OptionToggleSection`, `CollapsibleSettingToggle`, etc.).
- [ ] Add **Apollo integration tests** for widget-related hooks/components using `MockedProvider`.
- [ ] Expand current **Cypress smoke test** into a small regression suite for core SmartMenu flows.

---

## Stretch Goals (nice-to-have)
- [ ] Full Cypress E2E regression matrix (follow-up to smoke test).
- [ ] Extract `CollapsibleSettingToggle` shared component.
- [ ] Build storybook-powered design system doc site (autodocs).
- [ ] Explore Radix UI primitives for complex menus.

---

## Definition of Done
- Storybook runs locally with 90 %+ core components covered by stories.
- Chromatic CI status required on PR merge.
- No critical a11y violations in stories.
- Updated docs communicated to team.
