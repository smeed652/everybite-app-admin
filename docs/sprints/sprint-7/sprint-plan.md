# Sprint 7 – AWS Amplify Deployment (2025-07-14 → 2025-07-28)

Focus: deploy the EB SmartMenu Admin app to AWS Amplify with CI/CD, TLS, and observability.

## Goal / Definition of Done

A staging environment reachable at `https://admin-staging.everybite.com` is provisioned via AWS Amplify. GitHub Actions automatically builds, tests, and deploys every merge to `main`. Basic CloudWatch alarms are active.

---

## Phase 1 - Completed Work ✅

### Authentication & Infrastructure

- ✅ **AWS Cognito Integration** - Fully implemented with role-based access control
- ✅ **AWS Amplify Configuration** - Properly configured in `src/lib/auth.ts`
- ✅ **Environment Variables** - All AWS/Cognito env vars properly set up
- ✅ **Docker Setup** - Multi-stage Dockerfile ready for production
- ✅ **CI/CD Pipeline** - GitHub Actions with comprehensive testing
- ✅ **Testing Infrastructure** - Complete test suite (unit, integration, E2E)

### Application Features

- ✅ **User Management** - Invite, enable/disable, reset password, delete users
- ✅ **SmartMenu Management** - List, detail, features, marketing panels
- ✅ **Dashboard Analytics** - Player analytics with charts and metrics
- ✅ **UI Components** - Complete shadcn/ui component library
- ✅ **Responsive Design** - Mobile-friendly layout with proper navigation

---

## Phase 2 - AWS Amplify Deployment Tasks

| #   | Task                                                                                  | Owner | Est.  | DoD                                              |
| --- | ------------------------------------------------------------------------------------- | ----- | ----- | ------------------------------------------------ |
| 1   | **AWS Account & IAM Setup** – create Amplify service roles, configure AWS credentials |       | 0.5 d | IAM roles created, credentials stored securely   |
| 2   | **Amplify App Creation** – create app in AWS Console, connect GitHub repo             |       | 0.5 d | App created, repo connected, basic build working |
| 3   | **Build Configuration** – create `amplify.yml`, configure Vite build settings         |       | 1 d   | `amplify.yml` created, build succeeds locally    |
| 4   | **Environment Variables Migration** – move from `.env.local` to Amplify env vars      |       | 0.5 d | All env vars migrated, app connects to services  |
| 5   | **Custom Domain Setup** – configure `admin-staging.everybite.com` with SSL            |       | 1 d   | Domain working, green lock in browser            |
| 6   | **Environment Separation** – set up staging/prod branches and domains                 |       | 0.5 d | Different environments for different branches    |
| 7   | **CI/CD Enhancement** – update GitHub Actions for Amplify deployment                  |       | 1 d   | Pipeline deploys to Amplify, tests pass          |
| 8   | **Testing Integration** – update E2E tests for Amplify URLs                           |       | 0.5 d | Smoke tests run against staging environment      |
| 9   | **Monitoring Setup** – CloudWatch logs, basic alarms, Sentry integration              |       | 1 d   | Logs visible, alarms configured, errors tracked  |
| 10  | **Documentation & Hand-off** – update `DEPLOY.md`, create architecture diagram        |       | 0.5 d | Docs updated, diagram created, reviewed          |

---

## Technical Implementation Details

### Amplify Build Configuration

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables Required

- `VITE_AWS_REGION` - AWS region for Cognito
- `VITE_COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `VITE_COGNITO_APP_CLIENT_ID` - Cognito App Client ID
- `VITE_GRAPHQL_URI` - GraphQL API endpoint
- `VITE_API_KEY` - API key for GraphQL authentication
- `VITE_LOG_LEVEL` - Logging level

### Branch Strategy

- `main` → Production environment (`admin.everybite.com`)
- `develop` → Staging environment (`admin-staging.everybite.com`)
- Feature branches → Preview deployments

---

## Ceremonies

- Planning: Mon 07-14, 1 h
- Daily stand-up: 10 min
- Mid-sprint demo: Fri 07-18 – staging URL live
- Review & retro: Fri 07-25

---

## Risks / Mitigations

- **AWS Amplify learning curve** → Use AWS documentation, start with simple config
- **Environment variable migration** → Test thoroughly in staging before prod
- **Domain configuration complexity** → Follow AWS Amplify domain setup guide
- **Cost management** → Monitor Amplify usage, set up billing alerts
- **Rollback strategy** → Keep current Vercel deploy until Amplify is stable

---

## Success Metrics

- [ ] Staging environment accessible at `https://admin-staging.everybite.com`
- [ ] Production environment accessible at `https://admin.everybite.com`
- [ ] All tests pass in CI/CD pipeline
- [ ] E2E smoke tests run successfully against staging
- [ ] CloudWatch logs and alarms configured
- [ ] Documentation updated and reviewed
