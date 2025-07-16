# Amplify Migration Quick Reference

## Overview

This is a quick reference for migrating your Amplify app from us-east-1 (Virginia) to us-west-1 (Northern California).

## Automation Level: 70%

### ✅ What's Automated

- Lambda function deployment
- Configuration export/backup
- Environment variable templates
- Resource verification
- Script generation

### ⚠️ What Requires Manual Steps

- Amplify app creation in AWS Console
- GitHub repository connection
- Custom domain configuration
- SSL certificate setup
- Deployment gates configuration

## Quick Start Commands

### Option 1: Basic Migration

```bash
npm run migrate:us-west-1
```

### Option 2: Enhanced Automation

```bash
npm run migrate:amplify:automated
```

## Migration Timeline

| Step             | Duration      | Automation |
| ---------------- | ------------- | ---------- |
| Pre-migration    | 30 min        | 80%        |
| Lambda migration | 15 min        | 100%       |
| Amplify setup    | 45 min        | 0%         |
| Verification     | 30 min        | 60%        |
| Cleanup          | 15 min        | 90%        |
| **Total**        | **2.5 hours** | **70%**    |

## Required Information

Before running the migration, gather:

1. **Current Amplify App ID** (from us-east-1)
2. **GitHub Repository URL**
3. **Custom Domain** (if applicable)
4. **Cognito App Client ID**
5. **GraphQL API URI**
6. **Sentry DSN** (if using)

## Migration Steps

### 1. Run Migration Script

```bash
npm run migrate:amplify:automated
```

### 2. Follow Generated Instructions

The script creates a backup directory with:

- `MANUAL_STEPS.md` - Step-by-step manual instructions
- `create-amplify-app.sh` - Automated app creation script
- `env-vars.json` - Environment variables template
- Backup files of current configuration

### 3. Create New Amplify App

```bash
# Update env-vars.json with your values first
cd migration-backup-[timestamp]
./create-amplify-app.sh
```

### 4. Configure in AWS Console

- Set up custom domain
- Configure deployment gates
- Test the application

### 5. Clean Up

```bash
# After confirming everything works
npm run migrate:cleanup
```

## Rollback Plan

If migration fails:

1. **Keep old app running** until new one is tested
2. **Revert Lambda deployments** if needed
3. **Update DNS** to point back to old app
4. **Delete new app** if necessary

## Success Criteria

### Technical

- [ ] All Lambda functions in us-west-1
- [ ] Amplify app running in us-west-1
- [ ] Custom domain working with SSL
- [ ] All tests passing
- [ ] No cross-region API calls

### Business

- [ ] Zero downtime
- [ ] Improved performance
- [ ] Reduced costs
- [ ] Simplified management

## Common Issues

### Lambda Functions Already Exist

The script will detect existing functions and ask if you want to redeploy them.

### Custom Domain Issues

DNS propagation can take up to 48 hours. Plan accordingly.

### Environment Variables

Make sure to update all placeholder values in `env-vars.json`.

### SSL Certificate

Automatic but requires domain verification. Check your email for verification links.

## Support

If you encounter issues:

1. Check the backup files for configuration details
2. Review the manual steps guide
3. Verify AWS permissions
4. Check CloudWatch logs for errors

## Future Improvements

- **Terraform/CloudFormation**: Full infrastructure as code
- **AWS CDK**: TypeScript-based infrastructure
- **GitHub Actions**: Automated migration workflow
- **Custom CLI Tool**: Complete automation

## Documentation

- [Full Migration Guide](./AMPLIFY-REGION-MIGRATION.md)
- [Amplify Deployment Strategy](./AMPLIFY-DEPLOYMENT-STRATEGY.md)
- [Lambda Deployment Guide](../LAMBDA_DEPLOYMENT_GUIDE.md)
