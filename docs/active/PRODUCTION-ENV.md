# Production Environment Configuration

## Required Environment Variables

Copy these variables to your production environment (Vercel, AWS Amplify, etc.):

```bash
# GraphQL API
VITE_GRAPHQL_URI=https://api.everybite.com/graphql

# AWS Configuration
VITE_AWS_REGION=us-west-1
VITE_COGNITO_USER_POOL_ID=us-west-1_XXXXXXX
VITE_COGNITO_APP_CLIENT_ID=abcd1234abcd1234abcd1234

# Logging and Monitoring
VITE_LOG_LEVEL=info
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Feature Flags (Production)
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## Deployment Platform Configuration

### Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable above
4. Set the environment to "Production"

### AWS Amplify

1. Go to your app settings
2. Navigate to "Environment variables"
3. Add each variable above
4. Ensure they're applied to the production branch

## Security Considerations

- Never commit actual production values to git
- Use environment-specific secrets management
- Rotate credentials regularly
- Monitor for unauthorized access

## Validation

After setting up environment variables, run:

```bash
npm run deploy:validate production
```

This will verify that all required variables are properly configured.
