# Project Build-Out & Refactoring Checklist

This document consolidates tasks from the Project Unification Plan, Development Guide, and Style Guide to track overall progress.

## Phase 1: Initial Setup & Preparation (Primarily from Development Guide & Project Plan)

- [ ] **Git Setup & Strategy (from Project Unification Plan & Dev Guide):**
    - [ ] 1. Create a Feature Branch (e.g., `feat/component-unification`).
    - [ ] 2. Ensure Clean State on `main` before branching.
    - [ ] 3. Define/Confirm Git Workflow (Conventional Commits, PR Process).
- [ ] **Project Configuration (from Development Guide):**
    - [ ] 1. Initialize Project (if new, using CRA/Vite).
    - [ ] 2. Install Core Dependencies (Routing, State Management, UI Library, etc.).
    - [ ] 3. Set Up Environment Variables (and document them).
    - [ ] 4. Configure Linters and Formatters (ESLint, Prettier).
    - [ ] 5. Configure Path Aliases.
    - [ ] 6. Testing Setup (Vitest/Jest, React Testing Library).
    - [ ] 7. Storybook Setup (Optional - if used).
- [ ] **Style Guide & Resources Setup (from Style Guide):**
    - [ ] 1. Add guidelines for Logo Usage to `STYLE_GUIDE.md`.
    - [ ] 2. Ensure links to Design System/UI Kit (Figma, etc.) are in `STYLE_GUIDE.md`.
    - [ ] 3. Ensure links to Brand Assets are in `STYLE_GUIDE.md`.

## Phase 2: Component Unification & Refactoring (from Project Unification Plan)

- [ ] **1. Understand and Adhere to Naming Conventions:** (Defined in `PROJECT_UNIFICATION_PLAN.md` and `DEVELOPMENT_GUIDE.md`).
- [ ] **2. Iterative Migration (Feature by Feature):**
    - [ ] **a. Analyze `components_refactored`:** For each component:
        - [ ] Determine its correct place in the new unified structure.
        - [ ] If an older version exists in `components`, the refactored version replaces it.
        - [ ] Move the component.
        - [ ] Update all its import paths.
    - [ ] **b. Review `components`:** After migrating a feature from `components_refactored`, review remaining components for that feature in the original `components` directory. Move/organize as needed.
    - [ ] **c. Testing (During Migration):**
        - [ ] Run linters and formatters.
        - [ ] Run unit and integration tests for affected components.
        - [ ] Perform manual browser testing of affected UI.
- [ ] **3. Commit Changes Frequently:** (Use descriptive messages, reference plan).
- [ ] **4. Repeat Migration Steps:** (For all features/components).
- [ ] **5. Storybook Alignment (If Storybook is used - from Style Guide):**
    - [ ] Reorganize Storybook structure to mirror the new component directory structure.
- [ ] **6. Final Review & Cleanup (Post-Migration):**
    - [ ] Review `client/src/components` for old, orphaned, or misplaced files.
    - [ ] Ensure all tests (unit, integration, E2E) pass project-wide.
- [ ] **7. Remove `components_refactored` directory:** (After thorough verification).

## Phase 3: Documentation & Finalization (from Project Unification Plan)

- [ ] **1. Update Project Documentation:** (READMEs, internal docs).
- [ ] **2. Create/Update `CONTRIBUTING.md`:** (Outline file naming, directory structure).
- [ ] **3. Final Review of `feat/component-unification` branch.**
- [ ] **4. Merge `feat/component-unification` into the main development branch.**
- [ ] **5. Schedule regular reviews of Style Guide and Development Guide.**
