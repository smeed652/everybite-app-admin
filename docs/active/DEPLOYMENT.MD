# Deployment Guide

## Environments

### Development

- **URL**: [dev-url]
- **Branch**: `develop`
- **Deployment**: Automatic on push
- **Validation**: Basic tests and build checks

### Staging

- **URL**: [staging-url]
- **Branch**: `staging`
- **Deployment**: Manual via `npm run deploy:staging`
- **Validation**: Full test suite, build validation, environment checks

### Production

- **URL**: [production-url]
- **Branch**: `production`
- **Deployment**: Manual via `npm run deploy:production`
- **Validation**: Complete validation including security checks

## Deployment Process

### Prerequisites

- Access to deployment platform
- Required environment variables set
- Sufficient permissions
- All tests passing

### Quick Deployment Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Validate deployment (any environment)
npm run deploy:validate [environment]

# Check workflow status
npm run workflow:status
```

### Manual Deployment Steps

1. **Prepare Release**
   - Create release branch from `develop`
   - Update version in `package.json`
   - Update CHANGELOG.md
   - Create pull request to `staging`

2. **Deploy to Staging**
   - Run validation: `npm run deploy:validate staging`
   - Deploy: `npm run deploy:staging`
   - Verify deployment in staging environment
   - Run smoke tests: `npm run test:e2e:smoke`

3. **Deploy to Production**
   - Run validation: `npm run deploy:validate production`
   - Deploy: `npm run deploy:production`
   - Verify production deployment
   - Monitor for any issues

## Rollback Procedure

1. Identify the last known good version
2. Create hotfix branch: `./scripts/git-workflow.sh create-hotfix rollback-<version>`
3. Revert to previous deployment
4. Deploy hotfix: `./scripts/git-workflow.sh finish-hotfix rollback-<version>`
5. Verify system stability
6. Document the rollback

## Environment Variables

| Variable                     | Required | Description                   | Example                             |
| ---------------------------- | -------- | ----------------------------- | ----------------------------------- |
| `VITE_GRAPHQL_URI`           | Yes      | GraphQL API endpoint          | `https://api.everybite.com/graphql` |
| `VITE_AWS_REGION`            | Yes      | AWS region for Cognito        | `us-west-1`                         |
| `VITE_COGNITO_USER_POOL_ID`  | Yes      | Cognito User Pool ID          | `us-west-1_XXXXXXX`                 |
| `VITE_COGNITO_APP_CLIENT_ID` | Yes      | Cognito App Client ID         | `abcd1234abcd1234abcd1234`          |
| `VITE_LOG_LEVEL`             | No       | Logging level                 | `info`                              |
| `VITE_SENTRY_DSN`            | No       | Sentry DSN for error tracking | `https://...`                       |

## Monitoring

- [Link to monitoring dashboard]
- Error tracking: Sentry
- Performance monitoring: AWS CloudWatch
- Log aggregation: AWS CloudWatch Logs

## Maintenance Windows

- Regular maintenance: [Day] [Time] [Time Zone]
- Emergency maintenance: As needed with notification

## Troubleshooting

1. **Deployment Fails**
   - Check CI/CD logs
   - Verify environment variables
   - Check resource limits
   - Run validation locally: `npm run deploy:validate`

2. **Application Not Starting**
   - Check application logs
   - Verify database connection
   - Check for port conflicts
   - Verify environment configuration

3. **Validation Fails**
   - Run tests locally: `npm test`
   - Check build: `npm run build`
   - Verify environment variables
   - Check for linting errors: `npm run lint`

## Contact

For deployment issues, contact:

- [Team Email]
- [Slack Channel]
- [On-call Schedule]

## Best Practices

### Before Deployment

- [ ] All tests pass locally
- [ ] Code review completed
- [ ] Environment variables verified
- [ ] Documentation updated
- [ ] Rollback plan prepared

### During Deployment

- [ ] Monitor deployment logs
- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Check error rates
- [ ] Monitor performance

### After Deployment

- [ ] Verify all features work
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Update deployment documentation
- [ ] Archive deployment artifacts
