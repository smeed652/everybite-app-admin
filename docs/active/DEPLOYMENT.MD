# Deployment Guide

## Overview

This project uses a Git Flow workflow with automated deployments to AWS Amplify. The deployment process includes validation, testing, and descriptive commit messages.

## Deployment Environments

### Staging Environment

- **Branch**: `staging`
- **URL**: [Staging URL]
- **Purpose**: Testing and validation before production
- **Deployment**: Automatic via AWS Amplify on push to `staging` branch

### Production Environment

- **Branch**: `production`
- **URL**: [Production URL]
- **Purpose**: Live application
- **Deployment**: Automatic via AWS Amplify on push to `production` branch

## Deployment Workflow

### Standard Deployment

```bash
# Deploy to staging
./scripts/git-workflow.sh deploy-staging

# Deploy to production (from staging)
./scripts/git-workflow.sh deploy-production
```

### Custom Deployment with Description

```bash
# Deploy to staging with custom description
./scripts/git-workflow.sh deploy-staging-custom "Fix Amplify YAML parsing issues"

# Deploy to production with custom description
./scripts/git-workflow.sh deploy-production-custom "Release SmartMenus feature"
```

## Deployment Commit Messages

The deployment script now generates descriptive commit messages that include:

### Standard Deployment Format

```
deploy(environment): from source - X commits

Recent changes:
  - commit message 1
  - commit message 2
  - commit message 3
  - commit message 4
  - commit message 5

Environment: staging/production
Source: develop/staging
Timestamp: 2025-07-15 06:35:00 UTC
```

### Custom Deployment Format

```
deploy(environment): custom description

Recent changes:
  - commit message 1
  - commit message 2
  - commit message 3
  - commit message 4
  - commit message 5

Environment: staging/production
Source: develop/staging
Description: custom description
Timestamp: 2025-07-15 06:35:00 UTC
```

### Hotfix Deployment Format

```
hotfix(environment): hotfix name

Environment: production/staging/develop
Type: urgent fix
Timestamp: 2025-07-15 06:35:00 UTC
```

## Deployment Validation

Before each deployment, the system runs validation checks:

1. **Amplify Compatibility Check**: Validates YAML syntax and npm scripts
2. **Unit Tests**: Runs all unit tests with Vitest
3. **Integration Tests**: Runs API smoke tests
4. **Build Check**: Verifies the application builds successfully
5. **Environment Variables**: Checks required environment variables

### Running Validation Manually

```bash
# Validate staging deployment
./scripts/deploy-validation.sh staging

# Validate production deployment
./scripts/deploy-validation.sh production
```

## Deployment Process

### 1. Staging Deployment

1. Ensure you're on the `develop` branch
2. Run: `./scripts/git-workflow.sh deploy-staging`
3. The script will:
   - Validate the deployment
   - Update both `develop` and `staging` branches
   - Generate a descriptive commit message
   - Push to `staging` branch
   - Trigger AWS Amplify deployment

### 2. Production Deployment

1. Ensure you're on the `staging` branch
2. Run: `./scripts/git-workflow.sh deploy-production`
3. The script will:
   - Validate the deployment
   - Update both `staging` and `production` branches
   - Generate a descriptive commit message
   - Push to `production` branch
   - Trigger AWS Amplify deployment

### 3. Hotfix Deployment

1. Create hotfix branch: `./scripts/git-workflow.sh create-hotfix <name>`
2. Make your urgent fixes
3. Deploy hotfix: `./scripts/git-workflow.sh finish-hotfix <name>`
4. The script will deploy to all environments (production, staging, develop)

## Monitoring Deployments

### AWS Amplify Console

- Monitor deployment progress in the AWS Amplify console
- View build logs and deployment history
- Check deployment status and any errors

### Deployment History

The deployment history shows:

- Deployment name and status
- Build duration
- Commit message (now descriptive)
- Start time

## Troubleshooting

### Common Issues

1. **YAML Parsing Errors**
   - Check for unescaped colons in npm scripts
   - Use the validation script: `./scripts/deploy-validation.sh staging`

2. **Test Failures**
   - Run tests locally: `npm test`
   - Check for environment variable issues

3. **Build Failures**
   - Check build logs in Amplify console
   - Verify all dependencies are installed

### Validation Failures

If validation fails, the deployment will be blocked. Common causes:

- Unit test failures
- Integration test failures
- Missing environment variables
- YAML syntax errors in package.json scripts

## Best Practices

1. **Always test on staging first**
   - Deploy to staging before production
   - Verify functionality in staging environment

2. **Use descriptive commit messages**
   - Use the custom deployment options for important changes
   - Include context about what the deployment includes

3. **Monitor deployments**
   - Check Amplify console for deployment status
   - Review build logs for any issues

4. **Use hotfixes for urgent issues**
   - Create hotfix branches for critical bugs
   - Deploy hotfixes to all environments

## Related Documentation

- [Amplify YAML Rules](./AMPLIFY-YAML-RULES.md)
- [Development Guide](./DEVELOPMENT-GUIDE.MD)
- [Git Workflow](./GIT_WORKFLOW.md)
