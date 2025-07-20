# Sprint 8 – Quality & Coverage (2025-07-28 → 2025-08-11)

## 📊 Progress Tracking

- **Overall Progress**: 0% (0/43 tasks complete)

**Phase Breakdown**:

- **PHASE-2-User-Management**: 0% (0/18 tasks)
- **PHASE-4-APOLLO-DASHBOARD-FIXES**: 0% (0/25 tasks)

## 🏷️ Release Tags

- **Latest Tag**: `v1.0.1+249` - "Initial release tagging system implementation"
- **Build Number**: 249
- **Tag Date**: 2025-07-20
- **Branch**: main

## Goal / Definition of Done

Unit-test coverage ≥ 80 %, zero React `act(...)` warnings, no critical a11y violations in Storybook, and lint/format gates enforced in CI.

---

## Rank-Ordered Backlog

| #   | Task                                                                                    | Owner | Est.  | DoD                               |
| --- | --------------------------------------------------------------------------------------- | ----- | ----- | --------------------------------- |
| 1   | **CI coverage threshold** – configure Vitest to fail <80 % lines                        |       | 0.5 d | CI fails if below                 |
| 2   | **Shared component tests** – `ColorRow`, `ResourceHeader`, `Tabs`, `Button`, `Input`, … |       | 2 d   | New tests merged, coverage ≥ 80 % |
| 3   | **Fix React `act` warnings** – wrap updates in tests/pages                              |       | 1 d   | `npm test` shows zero warnings    |
| 4   | **Modal/dialog a11y** – add `aria-describedby`, focus traps                             |       | 1 d   | Storybook a11y runner passes      |
| 5   | **ESLint/Prettier gate** – add `lint:ci` job                                            |       | 0.5 d | Pipeline fails on new lints       |
| 6   | **Storybook bundle split** – configure manualChunks or `import()`                       |       | 1 d   | Largest chunk <500 kB             |
| 7   | **Docs updates** – README a11y & testing sections                                       |       | 0.5 d | PR merged                         |
| 8   | **Stretch: Sentry / X-Ray tracing**                                                     |       | 1 d   | Errors visible in Sentry          |

---

## Ceremonies

- Planning: Mon 07-28, 1 h
- Daily stand-up: 10 min
- Mid-sprint demo: Fri 08-01 – coverage badge green
- Review & retro: Fri 08-08

---

## Risks / Mitigations

- **Flaky tests** → Add retries in Vitest CI.
- **Coverage drop from large PRs** → Enforce threshold early.
- **Bundle split complexity** → Time-box to 1 d; else accept warning.
