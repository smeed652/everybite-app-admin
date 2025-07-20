# General Project - Development Guide & Best Practices

This document outlines recommended development practices, directory structure, and coding principles to ensure codebases are scalable, maintainable, and easy to work with across projects. Adapt and specify project-specific details as needed.

## I. Core Principles & Best Practices

- **Proactive Design & Modularity**: Before implementing new functionality, always consider the design. Prioritize a component-based approach, modularization, and the creation of reusable components. Actively work to prevent files from becoming overly long or complex.
- **Component-Based Architecture**: Break down UI into small, reusable components. Favor composition over inheritance. Keep components focused on a single responsibility.
- **File Size Limit**: Aim to keep files under 250 lines. If a file grows too large, it's a strong indicator that it needs to be refactored into smaller, more manageable modules or components.
- **Clear Props & Interfaces**: Define explicit props for components using TypeScript interfaces (or PropTypes for JavaScript projects).
- **State Management Strategy**:
  - Use local component state (e.g., `useState`, `useReducer` in React) for component-specific data.
  - Employ context APIs (e.g., React Context) for state that needs to be shared across a few nested components.
  - Consider a global state manager (e.g., Zustand, Redux, Jotai for React) for application-wide state if context becomes unwieldy or performance issues arise.
- **Custom Hooks for Reusable Logic**:
  - Custom hooks (functions starting with `use`) are a powerful React feature for extracting and reusing stateful logic from components.
  - Use them to keep UI components (atoms, molecules, organisms) lean and focused on rendering. Complex state management, data fetching, side effects, or business logic can be encapsulated within custom hooks.
  - This promotes better separation of concerns, enhances testability, and improves code readability.
  - Each use of a custom hook provides independent state to the component using it.
  - Custom hooks align well with Atomic Design by helping to create cleaner and more maintainable UI components at all levels. For example, an organism might use several custom hooks to manage different aspects of its behavior.
  - Global/shared hooks are placed in `client/src/hooks/`. Feature-specific hooks should be co-located within the feature's directory, typically in a `hooks` subfolder (e.g., `client/src/components/features/SmartMenu/hooks/` or `client/src/components/features/SmartMenu/FeatureSubSection/hooks/`). Component-specific hooks (if tightly coupled and not broadly reusable) can also be placed in a `hooks` subfolder within a complex component's directory.
- **Styling Approach**:
  - Leverage framework-specific styling solutions (e.g., MUI's `sx` prop, styled-components).
  - Maintain a consistent theme (colors, typography, spacing) defined in a central theme configuration. Refer to the project's `STYLE_GUIDE.md`.
- **Naming Conventions**:
  - Folders: `kebab-case` or `camelCase`.
  - Component files & Components: `PascalCase.tsx`. Use descriptive names, and apply specific suffixes based on the component's role as defined in the `PROJECT_UNIFICATION_PLAN.md` (e.g., `*Page.tsx`, `*Panel.tsx`, `*Settings.tsx`, `*Form.tsx`, `*List.tsx`, `*Item.tsx`, `*Card.tsx`). Common reusable UI components in `client/src/components/common/` may have generic names without feature prefixes or specific role suffixes unless a suffix clarifies its primary function (e.g. `DataTable.tsx`).
  - Hooks: `useCamelCase` (e.g., `useAuth.ts`).
  - Other JS/TS files: `camelCase` (e.g., `apiClient.ts`).
- **Exports & Imports**:
  - Use `index.ts` (or `index.js`) barrel files for cleaner imports from directories with multiple modules.
  - Set up path aliases (e.g., `@/*` for `src/*`) for cleaner import statements.
- **Asynchronous Operations**: Use `async/await` for clarity. Handle loading and error states gracefully in the UI.
- **Testing Practices**: - **General:** Write unit tests for utility functions, complex hooks, and individual components. Aim for good coverage of common and critical reusable components. All test files should use the `.tsx` extension. - **Unit Tests:** Co-located with the source file they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory). - **Integration Tests:**
  _ Feature-specific integration tests reside in a `__tests__` subfolder within the relevant feature directory (e.g., `client/src/components/features/SmartMenu/Basics/__tests__/SmartMenuBasicsFlow.integration.test.tsx`). Use the suffix `_.integration.test.tsx`.
        *   Broader, cross-feature integration tests are located in `client/src/tests/integration/`.
    -   **End-to-End (E2E) / Smoke Tests:** Located in `client/src/tests/e2e/`, using the suffix `\*.e2e.test.tsx`. - **Debugging:** When a unit test is failing, try to run it in isolation until it is fixed to speed up debugging. - **Refactoring:** Run tests after every refactoring to ensure functionality is preserved.
- **Holistic Bug Fixing**: When addressing issues, evaluate if related problems or underlying causes can be fixed concurrently to improve overall code health.
- **Git Management:** You will be doing the commits so I want you to make sure stage all the files and include a detail commit message. You should let me know when you are ready to commit and push so I have chance to save the code before the commit.

### Project-Specific Technical Decisions & Workflows

- **Service Layer Abstraction**: All network calls are wrapped in typed functions under `client/src/services/`, providing a stable API boundary between UI and backend.
- **Env-Controlled Logging**: A lightweight logger reads `VITE_LOG_LEVEL` (client) or `LOG_LEVEL` (server) to control log verbosity without code changes.
- **Environment Configuration**: Keep all runtime config in `.env.*` files; never hard-code URLs, secrets, or feature flags.
- **Stable Dependencies**: Install only stable (non-alpha/beta/rc) package versions. CI runs `npm audit` and `npm outdated` to flag risks.

- **GraphQL API Integration**: Refer to `GRAPHQL_API_SETUP_GUIDE.md` for detailed information on connecting to and interacting with the GraphQL API, including client setup (Apollo Client), authorization mechanisms (static API key and user-specific token handling), and environment variable usage (`REACT_APP_GRAPHQL_URI`, `REACT_APP_API_KEY`).
- **TypeScript Configuration (`tsconfig.json`)**: Maintain `tsconfig.json` diligently. For example, utilize the `exclude` array to prevent compilation of archived or irrelevant directories (e.g., `src/_archive`).
- **Feature Flags (`src/utils/featureFlags.ts`)**: Employ feature flags to manage the rollout of new features or UI versions. This allows for toggling between different implementations (e.g., `useNewWidgetsUI: false` was used to ensure V1 SmartMenu components remained active while V2 was in development).
- **Archiving Deprecated Code**: When components or features are deprecated, move them to a designated archive directory (e.g., `src/_archive/v2_smartmenu_components/`). Update `tsconfig.json` to exclude this directory. This practice keeps the active codebase clean while preserving historical code for reference.
- **Version Control & Releases (Git Tagging)**: Use Git tags with build numbers (e.g., `v1.2.0+45`) to mark significant releases or stable versions of the application or key features. This aids in tracking changes and managing deployments. See `RELEASE-TAGGING-GUIDE.md` for detailed tagging strategy and automation scripts.
- **Planning for Major Changes**: For significant refactoring efforts or new feature development, create planning documents (e.g., Markdown files like `SMARTMENU_DETAIL_PAGE_REFACTOR_PLAN.md`). These documents should outline the approach, component structure, data flow, and any API considerations before implementation begins.

- **Full-Height Page Layouts**:
  - **Objective**: Ensure that main page content areas (like tables or dashboards) can reliably fill the available vertical space of the viewport.
  - **Global CSS (`src/index.css`)**: Ensure `html, body, #root` (or your main app container ID) are set to `height: 100%; margin: 0; padding: 0; box-sizing: border-box;`. Also, set `*, *::before, *::after { box-sizing: inherit; }`.
  - **App Component (`App.tsx`)**: Should be structured to fill height, typically using flexbox: `display: 'flex', flexDirection: 'column', minHeight: '100vh'`.
  - **Page Components (e.g., `DashboardPage.tsx`)**:
    - These components, rendered by the router, should also be designed to fill the available space given by `App.tsx`.
    - Use `flexGrow: 1` for the main content area within the page if the page itself has a flex layout.
    - Example: `Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 /* Important for scroll within flex children */ }}`.
    - Inside the page, structure content with non-growing headers/footers (`flexShrink: 0`) and a main content section that grows (`flexGrow: 1, minHeight: 0`).
  - **Standard Implementation for Admin Pages:** For admin pages requiring a fixed header and scrollable content area, the reusable layout component `client/src/components/layout/AdminPageLayout.tsx` (as defined in `PROJECT_UNIFICATION_PLAN.md`) should be utilized to implement this pattern consistently.
  - **Child Content Components (e.g., `SmartMenuTable.tsx`, `SmartMenuDataGrid.tsx`)**:
    - These components should use `height: '100%'` and internal flexbox (`display: 'flex', flexDirection: 'column'`) to manage their own content within the space provided by their parent page component.
    - For elements like a `DataGrid` intended to fill the remaining space within its direct parent, use `flexGrow: 1`.
- **Code Splitting**: For larger applications, use techniques like `React.lazy` and `Suspense` (or equivalent for other frameworks) for route-based code splitting to improve initial load times.
- **Linting & Formatting**: Enforce code quality and consistency using tools like ESLint and Prettier, configured for the project.
- **Dependency Management**:
  - Regularly review and update dependencies to their latest stable versions to incorporate bug fixes, performance improvements, and security patches.
  - Use `npm audit` or `yarn audit` to check for vulnerabilities.
  - Be mindful of breaking changes when upgrading major versions.
  - Remove unused dependencies to keep the project lean.

## II. General Directory Structure (`client/src/`)

This project follows a feature-based and role-based directory structure to organize components, hooks, types, and tests. This approach aims for clarity, scalability, and ease of navigation. The primary source for components is `client/src/components/`.

Refer to the `PROJECT_UNIFICATION_PLAN.md` for the most detailed and up-to-date examples and rationale.

### Key Directories:

- **`client/src/components/`**: The root for all UI components.
  - **`common/`**: Truly generic, reusable UI components (e.g., `Button.tsx`, `Modal.tsx`, `DataGrid.tsx`). These should be application-agnostic if possible.
  - **`features/`**: Components specific to a particular feature or major section of the application.
    - **`[FeatureName]/`** (e.g., `SmartMenu/`, `UserManagement/`):
      - **`[SubFeatureOrPage]/`** (e.g., `Basics/`, `Design/`, `UserDetailsPage/`): For larger features, further subdirectories help organize components by page or major sub-section.
        - `[ComponentName]Page.tsx`: Top-level component for a specific page/view within the feature.
        - `[ComponentName]Panel.tsx`: Significant, distinct UI sections within a page.
        - `[ComponentName]Settings.tsx`: Components focused on configuration options.
        - `[ComponentName]Form.tsx`: Components primarily for data input.
        - `[ComponentName]List.tsx` / `[ComponentName]Item.tsx`: For displaying collections of data.
        - Other specific components related to this sub-feature/page.
        - **`hooks/`**: Hooks specific to this sub-feature/page.
        - **`types/`**: TypeScript types specific to this sub-feature/page.
        - **`__tests__/`**: Integration tests for this sub-feature/page (e.g., `*.integration.test.tsx`).
      - Components directly under `[FeatureName]/` if the feature is small or components are shared across its sub-features.
      - **`hooks/`**: Hooks shared across the `[FeatureName]`.
      - **`types/`**: Types shared across the `[FeatureName]`.
      - **`__tests__/`**: Integration tests for the overall `[FeatureName]`.
  - **`layout/`**: Components responsible for overall page structure and layout (e.g., `AdminPageLayout.tsx`, `Sidebar.tsx`, `Header.tsx`).
  - **`icons/`**: Custom SVG icon components, if any.

- **`client/src/hooks/`**: Global/shared custom React hooks, not specific to any single feature.

- **`client/src/pages/`**: (Consider deprecating or minimizing if pages are primarily feature components ending in `*Page.tsx` within `client/src/components/features/`) If used, these are top-level components that are directly rendered by routes, often composing feature components.

- **`client/src/services/`**: For API interaction logic, data fetching, and other external service integrations (e.g., `AuthService.ts`, `SmartMenuService.ts`).

- **`client/src/store/`**: Global state management setup (e.g., Zustand, Redux).
  - **`slices/` or `modules/`**: Feature-specific or domain-specific state logic.

- **`client/src/styles/`**: Global styles, theme overrides, base CSS.

- **`client/src/theme/`**: Theme configuration files (e.g., for MUI).

- **`client/src/types/`**: Global TypeScript type definitions and interfaces not specific to a single feature.

- **`client/src/utils/`**: Generic utility functions reusable across the application.

- **`client/src/tests/`**:
  - **`integration/`**: Broader, cross-feature integration tests.
  - **`e2e/`**: End-to-end tests.
  - _(Unit tests are co-located with their source files)._

- **`client/src/assets/`**: Static assets like images, fonts.

- **`client/src/config/`**: Application-level configuration files or constants.

- **`client/src/lib/`**: Third-party library configurations or wrappers.

- **`client/src/routes/`**: Centralized route definitions and configuration.

This structure aims to balance feature encapsulation with the discoverability of common and shared code. Always prioritize clarity and consult the `PROJECT_UNIFICATION_PLAN.md` for specific examples.

### Routing

This project uses **`react-router-dom` v6** for client-side routing.

- **Setup**: The main router is set up in `src/index.tsx` using `<BrowserRouter>`.
- **Route Definitions**: Routes are defined in `src/routes/index.tsx` using `<Routes>` and `<Route>` components. This centralized configuration is then imported and rendered by `src/App.tsx`.
- **Navigation**:
  - Programmatic navigation is typically handled using the `useNavigate()` hook.
  - Declarative navigation is done with the `<Link>` component (often styled or wrapped by MUI components) or `<NavLink>` for active state styling.
- **Route Parameters**: Accessed via the `useParams()` hook.
- **Protected Routes**: A `ProtectedRoute.tsx` component exists in `src/features/auth/components/`. Currently, it's a no-op as authentication is primarily handled via an API key included in Apollo Client requests. The `LayoutWrapper` concept (wrapping routes with a common layout) is implemented within `src/routes/index.tsx`.

**Note on Dependencies**:

- `react-router-dom` is listed in the `dependencies` section of `package.json`.
- The project also includes `@tanstack/react-router` in `dependencies`. This appears to be an unused dependency from a potential previous setup or planned migration. For now, all active routing is handled by `react-router-dom` v6.

## III. New Project Bootstrap & Setup Checklist

This checklist is designed to guide the setup of a new project, leveraging learnings from this one.

### A. Initial Project Setup

1.  **Bootstrap Application:**
    - This project was initially bootstrapped with Create React App: `npx create-react-app my-app --template typescript`.
    - Alternatively, consider modern alternatives like Vite: `npm create vite@latest my-app -- --template react-ts`.
2.  **Initialize Git Repository:**
    - `git init`
    - Create an initial commit.
    - Ensure a comprehensive `.gitignore` file is in place (CRA/Vite provide good defaults).
    - Set up a remote repository (e.g., on GitHub, GitLab).
3.  **Install Core Dependencies:**
    - Routing: `npm install react-router-dom`
    - State Management (if not using built-in context extensively): `npm install zustand` (or Redux Toolkit, Jotai, etc.)
    - API Client (GraphQL): `npm install @apollo/client graphql`
    - UI Library (MUI): `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`
    - Utility libraries: `npm install date-fns lodash` (or specific modules like `lodash-es`)
    - (Add any other project-critical libraries here)
4.  **Install Development Dependencies:**
    - ESLint & Prettier: `npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin` (adjust based on chosen ESLint config).
    - Testing: Ensure `@testing-library/react`, `@testing-library/jest-dom`, `jest` are set up (CRA includes these).

### B. Configuration

1.  **Environment Variables:**
    - Create `.env` and `.env.local` (add `.env.local` to `.gitignore`).
    - Define essential variables: `REACT_APP_GRAPHQL_URI` (or `VITE_GRAPHQL_URI`), `REACT_APP_API_KEY` (or `VITE_API_KEY`).
    - Document all required environment variables in `README.md` or a dedicated `.env.example` file.
2.  **TypeScript (`tsconfig.json`):**
    - Review and customize `compilerOptions`:
      - `"baseUrl": "./src"`
      - `"paths": { "@/*": ["*"] }` (for absolute imports like `@/components/*`)
      - `"target": "ES2020"` (or newer)
      - `"lib": ["dom", "dom.iterable", "esnext"]`
      - `"module": "esnext"`
      - `"jsx": "react-jsx"`
    - Configure `include` and `exclude` arrays (e.g., exclude `node_modules`, `build`, `dist`, `src/_archive`).
3.  **ESLint (`.eslintrc.js` or `.eslintrc.json`):**
    - Set up a base configuration (e.g., `eslint:recommended`, `plugin:react/recommended`, `plugin:@typescript-eslint/recommended`).
    - Integrate Prettier: `plugin:prettier/recommended`.
    - Add project-specific rules or overrides.
4.  **Prettier (`.prettierrc.js` or `.prettierrc.json`):**
    - Define code formatting preferences (e.g., `semi: true`, `singleQuote: true`, `tabWidth: 2`, `printWidth: 100`).
5.  **`package.json` Scripts:**
    - Ensure scripts for `start`, `build`, `test`, `lint`, `lint:fix`, `format` are present and correctly configured.
    - Example lint script: `"lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --quiet"`
    - Example format script: `"format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,md,json}\" --config ./.prettierrc.json"`

### C. Application Structure & Setup

1.  **Directory Structure:**
    - Implement the Atomic Design structure as outlined in "II. General Directory Structure".
    - Create initial directories: `src/components/{atoms,molecules,organisms,templates}`, `src/features`, `src/hooks`, `src/lib`, `src/pages`, `src/providers`, `src/routes`, `src/styles`, `src/theme`, `src/types`, `src/utils`.
2.  **MUI Theming:**
    - Create a custom theme file (e.g., `src/theme/theme.ts`). Define primary/secondary colors, typography, spacing, and component overrides.
    - Apply the theme globally using `<ThemeProvider>` in `src/index.tsx` or `src/App.tsx`.
3.  **Apollo Client Setup:**
    - Create `src/lib/apollo.ts` (or similar).
    - Implement `createApolloClient` function, configuring `HttpLink` (with URI from env var), `InMemoryCache`, and `ApolloLink` for authorization (adding API key to headers).
    - Refer to `GRAPHQL_API_SETUP_GUIDE.md` for detailed implementation.
    - Wrap the application with `<ApolloProvider>` in `src/index.tsx` or `src/App.tsx`.
4.  **Routing Setup:**
    - Create `src/routes/index.tsx` to define application routes using `react-router-dom`.
    - Set up `BrowserRouter` in `src/index.tsx`.
    - Implement `LayoutWrapper` and `ProtectedRoute` components if needed.
5.  **Global Styles:**
    - Set up `src/styles/global.css` (or `index.css`) for base styling, resets, and global font settings. Import it in `src/index.tsx`.
6.  **Feature Flags (Optional):**
    - If desired, create `src/utils/featureFlags.ts` for managing feature toggles.

### D. Documentation

1.  **Copy & Review Guides:**
    - Copy [DEVELOPMENT_GUIDE.md](cci:7://file:///Volumes/External%20Drive/EveryBite%20Dev%20Share/Front-end/EveryBite%20Projects/everybite-app-admin/DEVELOPMENT_GUIDE.md:0:0-0:0), `STYLE_GUIDE.md`, `GRAPHQL_API_SETUP_GUIDE.md` into the new project.
    - Review and update them to remove project-specific details not relevant to the new project, or to add new ones.
2.  **`README.md`:**
    - Update `README.md` with a project-specific overview, setup instructions (pointing to this checklist), and run commands.
    - Add "Key Technologies" and "Environment Variables" sections.

## IV. Workflow for Adding New Elements (Example for React)

### A. Adding a New Page

1.  **Create Page Component:** e.g., `src/pages/NewPage.tsx`.
2.  **Add Route:** In `src/routes/index.tsx`.
3.  **Add Navigation Link:** Update sidebar/menu component.
4.  **Develop Feature Module (if complex):** Create `src/features/newFeature/` and populate. Consider creating a planning document (see 'Planning for Major Changes' under Core Principles) if the feature is substantial.

### B. Adding a New Reusable UI Component (Atomic Design)

1.  **Determine Atomic Classification:** Identify whether the new component is an Atom, Molecule, Organism, or Template based on its complexity and purpose.
2.  **Create Component Directory & File:**
    - Atom: `src/components/atoms/NewAtomName/NewAtomName.tsx` (and `index.ts` for exports)
    - Molecule: `src/components/molecules/NewMoleculeName/NewMoleculeName.tsx` (and `index.ts`)
    - Organism: `src/components/organisms/NewOrganismName/NewOrganismName.tsx` (and `index.ts`)
    - Template: `src/components/templates/NewTemplateName/NewTemplateName.tsx` (and `index.ts`)
3.  **Implement Component:** Define props, structure, and styles adhering to `STYLE_GUIDE.md`.
4.  **Use Component:** Import and use where needed, composing atoms into molecules, molecules into organisms, etc.

### C. Adding a New Feature

1.  **Create Feature Directory:** e.g., `src/features/newFeature/`.
2.  **Define API & Types:** In `api/` and `types/` subdirectories.
3.  **Implement Data Logic & Hooks:** In `hooks/` subdirectory.
4.  **Create Feature-Specific Components:** In `components/` subdirectory.
5.  **Integrate:** Add to pages or layout as needed.

## V. Development Workflow

Adhering to a consistent development workflow improves collaboration and code quality.

### A. Branching Strategy

- **Main Branches:**
  - `main` (or `master`): Represents the production-ready code. Direct commits are typically disallowed. Merges happen from `develop` or release branches.
  - `develop`: Represents the latest development changes. This is the branch feature branches are created from and merged back into.
- **Feature Branches:**
  - Create a new branch for each new feature, bugfix, or task (e.g., `feature/user-authentication`, `fix/login-button-bug`, `chore/update-dependencies`).
  - Branch off from `develop`.
  - Name branches descriptively using `type/short-description` (e.g., `feature/JIRA-123-new-dashboard`, `fix/JIRA-456-api-error`).
- **Release Branches (Optional):**
  - For preparing a new production release: `release/v1.2.0`. Branched from `develop`. Only bug fixes and documentation changes are merged here. Once ready, merged into `main` and `develop`.
- **Hotfix Branches (Optional):**
  - For critical fixes in production: `hotfix/urgent-security-patch`. Branched from `main`. Merged back into `main` and `develop`.

### B. Commit Message Conventions

- **Clarity and Conciseness:** Write clear and concise commit messages.
- **Imperative Mood:** Start messages with a verb in the imperative mood (e.g., "Add login component," not "Added login component" or "Adds login component").
- **Conventional Commits (Recommended):**
  - Format: `type(scope): subject`
  - `type`: `feat` (new feature), `fix` (bug fix), `chore` (build changes, no production code change), `docs` (documentation), `style` (formatting), `refactor`, `test`, `perf`.
  - `scope` (optional): The part of the codebase affected (e.g., `auth`, `smartmenu-table`).
  - `subject`: Short description of the change (max 50-72 chars).
  - Example: `feat(auth): implement password reset functionality`
  - Example: `fix(smartmenu): correct layout calculation on mobile`
- **Body (Optional):** Provide more context after a blank line if the subject isn't enough.
- **Footer (Optional):** For referencing issue numbers (e.g., `Closes #123`, `Fixes JIRA-789`).

### C. Pull Request (PR) / Merge Request (MR) Process

1.  **Create PRs Early:** Open a PR early in the development process, even if it's a draft/WIP, to get feedback.
2.  **Target Branch:** Ensure PRs are targeted to merge into `develop` (or the appropriate integration branch).
3.  **Clear Description:**
    - Provide a clear title and a detailed description of the changes.
    - Explain the "what" and "why" of the changes, not just the "how."
    - Link to relevant issues or tasks (e.g., "Closes #123," "Addresses JIRA-456").
    - Include screenshots or GIFs for UI changes.
4.  **Self-Review:** Review your own code before requesting reviews from others.
5.  **Code Reviews:**
    - Require at least one (or more, depending on team policy) approval from other developers.
    - Reviewers should check for correctness, clarity, performance, security, and adherence to coding standards and style guides.
    - Provide constructive feedback.
6.  **Automated Checks:**
    - Ensure CI/CD pipelines (linting, testing, building) pass before merging.
7.  **Merge Strategy:**
    - Prefer squash merges or rebase and merge to keep the `develop` branch history clean, but this depends on team preference.
    - Delete the feature branch after merging.

## VI. Troubleshooting / Lessons Learned

This section documents common issues encountered and their resolutions or workarounds.

### A. ESLint `no-unused-vars` Auto-Fix

- **Issue:** The `@typescript-eslint/no-unused-vars` rule sometimes isn't automatically fixed by `eslint --fix`, even when it should be. This was particularly noted for unused imports or variables that ESLint could theoretically remove.
- **Potential Solutions/Debug Steps:**
  1.  **Run with Debug Output:** `eslint --fix --debug path/to/your/file.ts` to get more verbose logging.
  2.  **Clear Cache:** `eslint --fix --no-cache path/to/your/file.ts`.
  3.  **Alternative Plugins:** Consider using `eslint-plugin-unused-imports`, which is specifically designed for auto-fixing unused imports. Install (`npm install -D eslint-plugin-unused-imports`) and configure in `.eslintrc.js`:
      \`\`\`javascript
      // .eslintrc.js
      module.exports = {
      // ... other configs
      plugins: [
      '@typescript-eslint',
      'unused-imports', // Add this
      // ... other plugins
      ],
      rules: {
      // ... other rules
      '@typescript-eslint/no-unused-vars': 'off', // Turn off base rule
      'unused-imports/no-unused-imports': 'warn', // Or 'error'
      'unused-imports/no-unused-vars': [ // Optional: more specific handling
      'warn',
      { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
      ],
      },
      };
      \`\`\`
  4.  **Manual Review:** For persistent issues, manual review and removal might be necessary.
  5.  **IDE Integration:** Ensure your IDE's ESLint integration is correctly configured and using the project's ESLint version and configuration.

---

_This guide is a living document. Update it as project needs evolve and new best practices emerge._
