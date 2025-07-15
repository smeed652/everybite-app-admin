# MERN Stack with TypeScript

## Overview

This document outlines the MERN (MongoDB, Express, React, Node.js) stack with TypeScript implementation details.

## Core Technologies

### Frontend

- **Framework**: React 18+
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0+
- **State Management**: Redux Toolkit / React Query
- **Routing**: React Router 6+
- **Form Handling**: React Hook Form
- **Validation**: Zod / Yup
- **UI Components**: Headless UI / Radix UI
- **Icons**: Lucide React / Heroicons
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Cypress / Playwright

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.0+
- **API**: RESTful / GraphQL (Apollo Server)
- **Database**: MongoDB 6.0+
- **ODM**: Mongoose 7.0+
- **Authentication**: JWT + Passport.js
- **Validation**: Zod / Joi
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI

### Development Tools

- **Package Manager**: pnpm / yarn
- **Bundler**: Vite / Webpack
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Deployment**: Vercel (Frontend), AWS Lambda (API Proxy)
- **CI/CD**: GitHub Actions / GitLab CI

## Project Structure

```
src/
├── client/                 # Frontend code
│   ├── public/             # Static files
│   └── src/
│       ├── assets/        # Images, fonts, etc.
│       ├── components/     # Reusable UI components
│       ├── features/       # Feature-based modules
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       ├── pages/          # Page components
│       ├── services/       # API service layer
│       ├── store/          # State management
│       ├── types/          # TypeScript type definitions
│       ├── App.tsx         # Main App component
│       └── main.tsx        # Entry point
├── server/                 # Backend code
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── types/              # TypeScript type definitions
│   └── app.ts              # Express app setup
├── shared/                 # Shared code between frontend and backend
└── tests/                  # Integration/E2E tests
```

## Development Workflow

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- pnpm 8.0+ (recommended)

### Setup

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Scripts

```json
{
  "dev": "concurrently \"pnpm dev:server\" \"pnpm dev:client\"",
  "dev:client": "cd client && pnpm dev",
  "dev:server": "cd server && pnpm dev",
  "build": "pnpm build:client && pnpm build:server",
  "build:client": "cd client && pnpm build",
  "build:server": "cd server && pnpm build",
  "test": "pnpm test:client && pnpm test:server",
  "test:client": "cd client && pnpm test",
  "test:server": "cd server && pnpm test",
  "lint": "pnpm lint:client && pnpm lint:server",
  "lint:client": "cd client && pnpm lint",
  "lint:server": "cd server && pnpm lint",
  "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
}
```

## Best Practices

### TypeScript

- Enable strict mode
- Use type guards and type predicates
- Prefer interfaces for public API definitions
- Use type aliases for complex types
- Avoid using `any` type

### React

- Use functional components with hooks
- Follow React Hooks rules
- Use React.memo() for performance optimization
- Use useCallback and useMemo appropriately
- Keep components small and focused

### State Management

- Use Redux Toolkit for global state
- Use React Query for server state
- Keep local state close to where it's used
- Normalize state shape
- Use Redux DevTools for debugging

### Styling

- Use Tailwind's utility classes first
- Extract repeated styles with @apply
- Use CSS variables for theming
- Keep custom CSS minimal
- Follow BEM naming for custom components

### Testing

- Write unit tests for utilities and hooks
- Write integration tests for components
- Use Mock Service Worker for API mocking
- Follow Testing Library's guiding principles
- Aim for good test coverage (80%+)

## Deployment

### Production Build

```bash
# Build both client and server
pnpm build

# Start production server
pnpm start
```

### Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/app
JWT_SECRET=your_jwt_secret

# Client
VITE_API_URL=/api
VITE_SENTRY_DSN=your_sentry_dsn
```

## Monitoring

- **Error Tracking**: Sentry
- **Performance**: Lighthouse CI
- **Logging**: Winston + ELK Stack
- **APM**: New Relic / Datadog

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
