# EveryBite Admin - Development Guide

This document outlines the development standards, best practices, and project structure for the EveryBite Admin.

## Table of Contents
- [Core Principles](#core-principles)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing Strategy](#testing-strategy)
- [Performance](#performance)
- [Security](#security)
- [Git Workflow](#git-workflow)

## Core Principles

### 1. Component-Based Architecture
- Build small, reusable components with single responsibilities
- Follow the Atomic Design methodology (Atoms, Molecules, Organisms, Templates, Pages)
- Keep components focused and composable

### 2. Type Safety
- Use TypeScript for all new code
- Define clear interfaces for all props, state, and API responses
- Avoid using `any` type - be explicit with types

### 3. Performance
- Implement code splitting and lazy loading
- Optimize re-renders with React.memo and useMemo/useCallback
- Use virtualization for large lists

### 4. Accessibility
- Follow WCAG 2.1 AA standards
- Use semantic HTML elements
- Ensure keyboard navigation works
- Add proper ARIA attributes
- Test with screen readers

## Project Structure

```
src/
├── app/                    # App-wide configuration and components
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # Global providers (theme, auth, etc.)
├── components/             # Reusable UI components
│   ├── ui/                 # ShadCN/ui components
│   ├── forms/              # Form components
│   └── shared/             # Shared components across features
├── features/               # Feature-based modules
│   ├── auth/               # Authentication feature
│   ├── dashboard/          # Dashboard feature
│   └── settings/           # Settings feature
├── lib/                    # Utility functions and configs
│   ├── api/                # API clients and utilities
│   ├── constants/          # App-wide constants
│   └── utils/              # Helper functions
├── hooks/                  # Custom React hooks
├── styles/                 # Global styles and theme
├── types/                  # Global TypeScript types
└── public/                 # Static assets
```

## Code Style

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utility Functions**: camelCase (e.g., `formatDate.ts`)
- **Files & Directories**: kebab-case (e.g., `user-profile/`)
- **Types/Interfaces**: PascalCase with `I` prefix (e.g., `IUser`)
- **Enums**: PascalCase (e.g., `UserRole`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)

### File Organization
- Co-locate test files with their source files (e.g., `Button.tsx` and `Button.test.tsx`)
- Keep component-specific styles in the same directory as the component
- Group related components in feature directories

### Formatting
- Use Prettier for consistent code formatting
- Maximum line length: 100 characters
- Use 2 spaces for indentation
- Always use semicolons
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays

## State Management

### Local State
- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Use `useContext` for sharing state across components

### Global State
- Use Zustand for global state management
- Create stores in `src/stores/`
- Keep stores small and focused
- Use selectors to prevent unnecessary re-renders

### Server State
- Use TanStack Query for server state management
- Create query hooks in `src/features/[feature]/api/`
- Use query keys consistently
- Implement proper error handling and loading states

## API Integration

### GraphQL Client
- Use Apollo Client for GraphQL operations
- Configure in `src/lib/api/client.ts`
- Use generated types with GraphQL Codegen

### REST API
- Use `fetch` or `axios` for REST endpoints
- Create API service files in `src/lib/api/`
- Implement request/response interceptors for auth and error handling

### Error Handling
- Use error boundaries for React component errors
- Implement proper error handling in API calls
- Show user-friendly error messages
- Log errors to a monitoring service

## Testing Strategy

### Unit Testing
- Test individual functions and components in isolation
- Use Jest and React Testing Library
- Aim for high test coverage of business logic

### Integration Testing
- Test component interactions
- Mock API responses
- Test user flows

### E2E Testing
- Use Cypress for end-to-end tests
- Test critical user journeys
- Run in CI/CD pipeline

### Testing Best Practices
- Test behavior, not implementation
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Keep tests simple and focused

## Performance

### Code Splitting
- Use React.lazy and Suspense for route-based code splitting
- Split large bundles into smaller chunks

### Optimization
- Memoize expensive calculations with useMemo
- Use useCallback for function references
- Implement virtualization for large lists
- Optimize images and assets

### Bundle Analysis
- Use Webpack Bundle Analyzer
- Monitor bundle size
- Remove unused dependencies

## Security

### Authentication
- Use JWT for authentication
- Store tokens in HTTP-only cookies
- Implement proper session management

### Authorization
- Implement role-based access control (RBAC)
- Protect routes based on user roles
- Validate permissions on both client and server

### Input Validation
- Validate all user input on client and server
- Use Zod for schema validation
- Sanitize user-generated content

### Dependencies
- Keep dependencies up to date
- Regularly audit for vulnerabilities
- Use Dependabot for automated dependency updates

## Git Workflow

### Branch Naming
- `feature/`: New features
- `bugfix/`: Bug fixes
- `hotfix/`: Critical production fixes
- `chore/`: Maintenance tasks
- `docs/`: Documentation updates

### Commit Messages
Follow Conventional Commits:
```
type(scope): subject

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Pull Requests
- Keep PRs small and focused
- Include a clear description
- Reference related issues
- Request reviews from relevant team members
- Ensure all tests pass
- Update documentation as needed

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- MongoDB 6.0+

### Getting Started
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Environment Variables
Create a `.env` file in the root directory:
```
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:3000/api/graphql

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/smartmenu
```

## Code Review Guidelines

### What to Look For
- Code correctness and functionality
- Performance implications
- Security vulnerabilities
- Test coverage
- Code style and consistency
- Documentation
- Accessibility

### Review Process
1. Author creates a PR
2. Request reviews from relevant team members
3. Address all comments
4. Ensure all checks pass
5. Squash and merge when approved

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN/ui Documentation](https://ui.shadcn.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

### Tools
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [Commitlint](https://commitlint.js.org/)
- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Cypress](https://www.cypress.io/)

---
*This is a living document. Last updated: June 2025*
