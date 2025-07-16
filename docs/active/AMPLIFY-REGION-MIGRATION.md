# Amplify Region Migration Guide

## Overview

This document outlines the process for migrating an AWS Amplify app from one region to another. The migration involves moving both the Amplify app itself and ensuring all related AWS resources are in the target region.

## Current Setup Analysis

### Current Configuration

- **Amplify App**: us-east-1 (Virginia)
- **Cognito User Pool**: us-west-1 (Northern California) - `us-west-1_HuVwywmH1`
- **Lambda Functions**: Mixed (some in us-east-1, some in us-west-1)
- **Target Region**: us-west-1 (Northern California)

### Why Migrate?

- **Reduced Latency**: All services in same region
- **Lower Costs**: No cross-region data transfer
- **Simplified Management**: Everything in one region
- **Better Performance**: Faster authentication and API calls

## Migration Strategy

### What Can Be Automated (Scripts)

✅ **Lambda Functions**: Full automation via AWS CLI
✅ **Cognito Resources**: Can be recreated via scripts
✅ **Environment Variables**: Can be exported/imported
✅ **Build Configuration**: Can be copied
✅ **Custom Headers**: Can be configured via API

### What Requires Manual Steps (UI)

⚠️ **Amplify App Creation**: Must be done in AWS Console
⚠️ **GitHub Repository Connection**: Manual setup required
⚠️ **Custom Domain Configuration**: Manual DNS setup
⚠️ **SSL Certificate**: Automatic but requires domain verification
⚠️ **Deployment Gates**: Manual configuration in console

## Detailed Migration Plan

### Phase 1: Pre-Migration Preparation

#### 1.1 Export Current Configuration

```bash
# Export current Amplify app configuration
aws amplify get-app --app-id [CURRENT_APP_ID] --region us-east-1 > current-app-config.json

# Export environment variables
aws amplify list-environments --app-id [CURRENT_APP_ID] --region us-east-1 > current-environments.json

# Export build settings
aws amplify get-branch --app-id [CURRENT_APP_ID] --branch-name main --region us-east-1 > current-branch-config.json
```

#### 1.2 Document Current Resources

```bash
# List all Lambda functions
aws lambda list-functions --region us-east-1 --query 'Functions[?contains(FunctionName, `metabase-proxy`)].{Name:FunctionName,Region:Runtime}' --output table

# List Cognito resources
aws cognito-idp list-user-pools --max-results 10 --region us-west-1

# List IAM roles used by Lambda
aws iam list-roles --query 'Roles[?contains(RoleName, `metabase-proxy`)].RoleName' --output table
```

### Phase 2: Automated Migration (Scripts)

#### 2.1 Lambda Function Migration

```bash
# Run the migration script
npm run migrate:us-west-1

# This script will:
# - Verify Cognito resources in us-west-1
# - Redeploy all Lambda functions to us-west-1
# - Update environment variables
# - Provide new function URLs
```

#### 2.2 Cognito Resource Verification

```bash
# Verify User Pool exists in target region
aws cognito-idp describe-user-pool --user-pool-id us-west-1_HuVwywmH1 --region us-west-1

# List App Clients
aws cognito-idp list-user-pool-clients --user-pool-id us-west-1_HuVwywmH1 --region us-west-1
```

#### 2.3 Environment Variables Export

```bash
# Export current environment variables
aws amplify list-environments --app-id [CURRENT_APP_ID] --region us-east-1 \
  --query 'environments[].environmentVariables' --output json > env-vars-backup.json
```

### Phase 3: Manual Steps (UI Required)

#### 3.1 Create New Amplify App

**Location**: AWS Amplify Console (us-west-1 region)
**Steps**:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/home?region=us-west-1)
2. Click "New app" → "Host web app"
3. Connect to GitHub repository
4. Configure build settings (use existing `amplify.yml`)
5. Deploy initial build

#### 3.2 Configure Environment Variables

**Required Variables**:

```bash
VITE_AWS_REGION=us-west-1
VITE_COGNITO_USER_POOL_ID=us-west-1_HuVwywmH1
VITE_COGNITO_APP_CLIENT_ID=[your-app-client-id]
VITE_GRAPHQL_URI=[your-graphql-uri]
VITE_METABASE_API_URL=[new-lambda-function-url]
VITE_LOG_LEVEL=info
VITE_SENTRY_DSN=[your-sentry-dsn]
```

#### 3.3 Set Up Custom Domain

**Steps**:

1. Go to App settings → Domain management
2. Add custom domain: `admin-staging.everybite.com`
3. Verify domain ownership
4. Configure SSL certificate
5. Update DNS records if needed

#### 3.4 Configure Deployment Gates (Optional)

**Steps**:

1. Go to App settings → Build settings
2. Enable deployment gates
3. Add GitHub status check gate
4. Configure branch protection

### Phase 4: Post-Migration Verification

#### 4.1 Automated Testing

```bash
# Run smoke tests against new environment
npm run test:e2e:smoke

# Run API integration tests
npm run test:integration

# Verify Lambda functions
aws lambda list-functions --region us-west-1 --query 'Functions[?contains(FunctionName, `metabase-proxy`)].FunctionName'
```

#### 4.2 Manual Verification

- [ ] Login functionality works
- [ ] User management features work
- [ ] SmartMenu features work
- [ ] Metabase integration works
- [ ] Custom domain resolves correctly
- [ ] SSL certificate is valid
- [ ] Deployment gates work (if configured)

### Phase 5: Cleanup

#### 5.1 Delete Old Resources

```bash
# Delete old Lambda functions (after confirming new ones work)
aws lambda delete-function --function-name metabase-proxy-dev --region us-east-1
aws lambda delete-function --function-name metabase-proxy-staging --region us-east-1
aws lambda delete-function --function-name metabase-proxy-production --region us-east-1

# Delete old Amplify app (after confirming new one works)
aws amplify delete-app --app-id [OLD_APP_ID] --region us-east-1
```

#### 5.2 Update Documentation

- Update all region references in documentation
- Update CI/CD pipeline configurations
- Update monitoring and alerting

## Automation Scripts

### Main Migration Script

```bash
# Run the complete migration
npm run migrate:us-west-1
```

### Individual Scripts

```bash
# Deploy Lambda functions
cd lambda && ./deploy.sh [environment]

# Configure Amplify gates
npm run amplify:configure-gates

# Validate deployment
npm run deploy:validate
```

## Rollback Plan

### If Migration Fails

1. **Keep old Amplify app running** until new one is fully tested
2. **Revert Lambda deployments** if needed:
   ```bash
   cd lambda && ./deploy.sh [environment] --region us-east-1
   ```
3. **Update DNS** to point back to old app
4. **Delete new app** if necessary

### Rollback Triggers

- Authentication failures
- API integration failures
- Performance degradation
- Custom domain issues

## Timeline Estimate

| Phase             | Duration      | Automation Level  |
| ----------------- | ------------- | ----------------- |
| Pre-Migration     | 30 min        | 80% Automated     |
| Lambda Migration  | 15 min        | 100% Automated    |
| Amplify App Setup | 45 min        | 0% Automated      |
| Verification      | 30 min        | 60% Automated     |
| Cleanup           | 15 min        | 90% Automated     |
| **Total**         | **2.5 hours** | **70% Automated** |

## Risk Assessment

### High Risk

- **Custom Domain Configuration**: DNS propagation delays
- **SSL Certificate**: May take time to provision
- **User Experience**: Potential downtime during migration

### Medium Risk

- **Environment Variables**: Manual configuration errors
- **Deployment Gates**: Complex setup requirements
- **Lambda Function URLs**: Need to update frontend configuration

### Low Risk

- **Lambda Migration**: Fully automated and tested
- **Cognito Resources**: Already in target region
- **Code Deployment**: Standard Amplify process

## Success Criteria

### Technical Success

- [ ] All Lambda functions deployed to us-west-1
- [ ] Amplify app running in us-west-1
- [ ] Custom domain working with SSL
- [ ] All tests passing
- [ ] No cross-region API calls

### Business Success

- [ ] Zero downtime during migration
- [ ] Improved performance metrics
- [ ] Reduced AWS costs
- [ ] Simplified infrastructure management

## Future Improvements

### Full Automation Possibilities

- **Terraform/CloudFormation**: Infrastructure as code
- **AWS CDK**: TypeScript-based infrastructure
- **Custom CLI Tool**: Automated migration tool
- **GitHub Actions**: Automated migration workflow

### Monitoring and Alerting

- **CloudWatch Alarms**: Cross-region monitoring
- **Sentry Integration**: Error tracking across regions
- **Performance Monitoring**: Latency and cost tracking

## Conclusion

While the Amplify app creation itself requires manual steps, approximately **70% of the migration can be automated** through scripts. The key is proper planning, testing, and having a solid rollback plan.

The migration script (`scripts/migrate-to-us-west-1.sh`) handles the automated portions, while this document provides the manual steps and overall strategy for a successful migration.
