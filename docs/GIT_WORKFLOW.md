# Git Workflow Guide

## Overview

This document outlines the Git branching strategy and workflow for the EveryBite App Admin project. We use a **Git Flow** approach with three main branches that correspond to our AWS Amplify environments.

## Branch Structure

```
main (production)     ← AWS Amplify Production Environment
├── staging           ← AWS Amplify Staging Environment
├── develop           ← AWS Amplify Develop Environment
└── feature branches  ← Local development branches
```

## Branch Purposes

### Main Branch (`main`)

- **Purpose**: Production-ready code
- **Deployment**: Automatically deploys to AWS Amplify Production
- **Access**: Protected - requires pull request and approval
- **Updates**: Only via staging → main merges or hotfixes

### Staging Branch (`staging`)

- **Purpose**: Pre-production testing
- **Deployment**: Automatically deploys to AWS Amplify Staging
- **Access**: Protected - requires pull request and approval
- **Updates**: Via develop → staging merges or hotfixes

### Develop Branch (`develop`)

- **Purpose**: Integration branch for features
- **Deployment**: Automatically deploys to AWS Amplify Develop
- **Access**: Protected - requires pull request and approval
- **Updates**: Via feature branch merges

### Feature Branches

- **Naming**: `feature/descriptive-name` (e.g., `feature/user-authentication`)
- **Purpose**: Individual feature development
- **Source**: Created from `develop`
- **Destination**: Merged back to `develop`

### Hotfix Branches

- **Naming**: `hotfix/descriptive-name` (e.g., `hotfix/critical-security-fix`)
- **Purpose**: Urgent production fixes
- **Source**: Created from `main`
- **Destination**: Merged to `main`, `staging`, and `develop`

## Workflow Commands

We provide a convenient script to manage the Git workflow: `./scripts/git-workflow.sh`

### Available Commands

```bash
# Feature Development
./scripts/git-workflow.sh create-feature <name>     # Create feature branch
./scripts/git-workflow.sh finish-feature <name>     # Merge feature to develop

# Deployment
./scripts/git-workflow.sh deploy-staging            # Deploy develop → staging
./scripts/git-workflow.sh deploy-production         # Deploy staging → main

# Hotfixes
./scripts/git-workflow.sh create-hotfix <name>      # Create hotfix branch
./scripts/git-workflow.sh finish-hotfix <name>      # Deploy hotfix to all envs

# Status
./scripts/git-workflow.sh status                    # Show current status
./scripts/git-workflow.sh help                      # Show help
```

## Development Workflow

### 1. Starting a New Feature

```bash
# Create and switch to feature branch
./scripts/git-workflow.sh create-feature user-authentication

# Make your changes and commit
git add .
git commit -m "feat: add user authentication system"

# Push feature branch (optional, for backup)
git push origin feature/user-authentication
```

### 2. Completing a Feature

```bash
# Ensure you're on the feature branch
git checkout feature/user-authentication

# Finish the feature (merges to develop)
./scripts/git-workflow.sh finish-feature user-authentication
```

### 3. Deploying to Staging

```bash
# Deploy develop to staging
./scripts/git-workflow.sh deploy-staging
```

### 4. Deploying to Production

```bash
# Deploy staging to production
./scripts/git-workflow.sh deploy-production
```

## Hotfix Workflow

### 1. Creating a Hotfix

```bash
# Create hotfix branch from main
./scripts/git-workflow.sh create-hotfix critical-security-fix

# Make urgent changes
git add .
git commit -m "fix: resolve critical security vulnerability"
```

### 2. Deploying a Hotfix

```bash
# Deploy hotfix to all environments
./scripts/git-workflow.sh finish-hotfix critical-security-fix
```

## Branch Protection Rules

### GitHub Repository Settings

Configure these protection rules in your GitHub repository:

#### Main Branch Protection

- ✅ Require a pull request before merging
- ✅ Require approvals (at least 1 reviewer)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Restrict pushes that create files larger than 100 MB
- ✅ Allow force pushes: ❌ Disabled
- ✅ Allow deletions: ❌ Disabled

#### Staging Branch Protection

- ✅ Require a pull request before merging
- ✅ Require approvals (at least 1 reviewer)
- ✅ Require status checks to pass before merging
- ✅ Allow force pushes: ❌ Disabled
- ✅ Allow deletions: ❌ Disabled

#### Develop Branch Protection

- ✅ Require a pull request before merging
- ✅ Require approvals (at least 1 reviewer)
- ✅ Allow force pushes: ✅ Enabled (for team leads)
- ✅ Allow deletions: ❌ Disabled

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```bash
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve UpdateWidget mutation sending empty input"
git commit -m "docs: update deployment guide"
git commit -m "chore: update dependencies"
```

## Environment Variables

Each environment has its own set of environment variables in AWS Amplify:

### Production (`main`)

- `VITE_API_URL`: Production API endpoint
- `VITE_COGNITO_USER_POOL_ID`: Production Cognito User Pool
- `VITE_COGNITO_CLIENT_ID`: Production Cognito Client ID

### Staging (`staging`)

- `VITE_API_URL`: Staging API endpoint
- `VITE_COGNITO_USER_POOL_ID`: Staging Cognito User Pool
- `VITE_COGNITO_CLIENT_ID`: Staging Cognito Client ID

### Develop (`develop`)

- `VITE_API_URL`: Development API endpoint
- `VITE_COGNITO_USER_POOL_ID`: Development Cognito User Pool
- `VITE_COGNITO_CLIENT_ID`: Development Cognito Client ID

## Best Practices

### 1. Always Work on Feature Branches

Never commit directly to `main`, `staging`, or `develop`. Always create a feature branch for your work.

### 2. Keep Branches Up to Date

Regularly pull the latest changes from the parent branch to avoid merge conflicts.

### 3. Write Clear Commit Messages

Use descriptive commit messages that explain what and why, not how.

### 4. Test Before Merging

Ensure all tests pass and the application works correctly before merging to higher environments.

### 5. Use Pull Requests

Create pull requests for all merges to protected branches for code review.

### 6. Tag Releases

Tag important releases in production:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Troubleshooting

### Merge Conflicts

If you encounter merge conflicts:

1. **Don't panic** - conflicts are normal
2. **Understand the conflict** - read the conflict markers
3. **Resolve carefully** - choose the correct code
4. **Test thoroughly** - ensure the resolved code works
5. **Commit the resolution** - use a clear commit message

### Branch Cleanup

To clean up old feature branches:

```bash
# List all branches
git branch -a

# Delete local feature branch
git branch -d feature/old-feature

# Delete remote feature branch
git push origin --delete feature/old-feature
```

### Emergency Rollback

If you need to rollback production:

```bash
# Create rollback branch from previous commit
git checkout main
git checkout -b hotfix/emergency-rollback
git revert <commit-hash>
./scripts/git-workflow.sh finish-hotfix emergency-rollback
```

## Team Guidelines

### Code Review Process

1. Create a pull request from your feature branch to `develop`
2. Request reviews from team members
3. Address feedback and make necessary changes
4. Merge only after approval

### Release Process

1. Ensure `develop` is stable and tested
2. Deploy to staging: `./scripts/git-workflow.sh deploy-staging`
3. Test thoroughly in staging environment
4. Deploy to production: `./scripts/git-workflow.sh deploy-production`
5. Monitor production for any issues

### Communication

- Notify the team before major deployments
- Use Slack/Teams for deployment announcements
- Document any deployment issues or rollbacks

## Resources

- [Git Flow Documentation](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
