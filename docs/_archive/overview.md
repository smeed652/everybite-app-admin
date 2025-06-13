# EveryBite Admin (everybite.app.admin)

## Description
A comprehensive admin panel for configuring and managing restaurant configurations across locations. This application provides an intuitive interface for restaurant owners and administrators to customize their digital presence, track performance metrics, and manage their online settings.

## Project Goals
- [ ] Create a user-friendly interface for menu management
- [ ] Implement real-time analytics and reporting
- [ ] Ensure high performance and scalability
- [ ] Maintain WCAG accessibility standards
- [ ] Provide comprehensive documentation

## Success Metrics
- [ ] 90%+ test coverage
- [ ] Sub-second page load times
- [ ] 99.9% uptime
- [ ] Positive user feedback from beta testers

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 3.0+
- **State Management**: Redux Toolkit + React Query
- **Routing**: React Router 6
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Cypress

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **API**: RESTful + GraphQL (Apollo Server)
- **Database**: MongoDB 6.0+ with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Infrastructure
- **Hosting**: Vercel (Frontend), Heroku (Backend)
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, LogRocket
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- pnpm 8.0+ (recommended)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd [project-name]

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start development servers
pnpm dev
```

### Available Scripts
- `pnpm dev`: Start development servers
- `pnpm build`: Build for production
- `pnpm test`: Run tests
- `pnpm lint`: Run linter
- `pnpm format`: Format code

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

## Documentation
- [Development Rules](DEVELOPMENT_RULES.md)
- [API Documentation](API_DOCS.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Tech Stack](TECH_STACK_MERN_TS.md)
- [Testing Strategy](TESTING_STRATEGY.md)
- [Code Review Guidelines](CODE_REVIEW.md)

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
[Specify License]

## Contact
[Your Name] - [Your Email]
[Project Link](https://github.com/yourusername/projectname)
