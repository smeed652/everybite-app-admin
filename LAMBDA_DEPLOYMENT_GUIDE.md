# Lambda Function Deployment Guide

## Overview

We've created an AWS Lambda function that will replace the Express backend proxy. This approach is **perfect for AWS Amplify** because:

✅ **No server management** - AWS handles everything  
✅ **Works across all environments** - dev, staging, production  
✅ **Cost-effective** - pay only for usage  
✅ **Secure** - credentials stay in AWS  
✅ **Scalable** - automatically handles traffic

## What We've Created

### 1. Lambda Function (`lambda/metabase-proxy/`)

- **`index.js`** - Main Lambda function with Metabase API proxy
- **`package.json`** - Dependencies (axios)
- **Endpoints**:
  - `/metabase/dashboard` - Dashboard metrics
  - `/metabase/users` - User data

### 2. Deployment Scripts

- **`lambda/deploy.sh`** - Automated deployment script
- **`lambda/test-local.js`** - Local testing script
- **`lambda/README.md`** - Detailed documentation

### 3. Updated Frontend

- **`src/hooks/useMetabase.ts`** - Updated to use environment variables
- **Environment-aware** - Uses localhost in dev, Lambda URL in production

## Quick Start

### Step 1: Deploy Lambda Function

```bash
# Navigate to lambda directory
cd lambda

# Deploy to dev environment
./deploy.sh dev

# The script will output your Lambda function URL
# Example: https://abc123.lambda-url.us-west-1.on.aws/
```

### Step 2: Update Environment Variables

In your AWS Amplify Console:

1. Go to **App settings** → **Environment variables**
2. Add: `VITE_METABASE_API_URL=https://your-lambda-function-url.amazonaws.com`
3. Deploy the changes

### Step 3: Test

1. **Test Lambda directly**:

   ```bash
   curl "https://your-lambda-function-url.amazonaws.com/metabase/dashboard"
   ```

2. **Test frontend**:
   - Deploy your app
   - Navigate to Dashboard
   - Check that Metabase data loads

## Environment Setup

### Development

```bash
# .env.local
VITE_METABASE_API_URL=http://localhost:4000
```

### Staging/Production

```bash
# AWS Amplify Environment Variables
VITE_METABASE_API_URL=https://metabase-proxy-staging.amazonaws.com
VITE_METABASE_API_URL=https://metabase-proxy-production.amazonaws.com
```

## Deployment Commands

```bash
# Deploy to different environments
./deploy.sh dev
./deploy.sh staging
./deploy.sh production

# Each creates a separate Lambda function:
# - metabase-proxy-dev
# - metabase-proxy-staging
# - metabase-proxy-production
```

## Benefits Over Express Backend

| Aspect           | Express Backend            | Lambda Function              |
| ---------------- | -------------------------- | ---------------------------- |
| **Deployment**   | ❌ Doesn't work on Amplify | ✅ Perfect for Amplify       |
| **Scaling**      | ❌ Manual management       | ✅ Automatic                 |
| **Cost**         | ❌ Always running          | ✅ Pay per use               |
| **Maintenance**  | ❌ Server management       | ✅ AWS handles it            |
| **Security**     | ❌ Credentials in code     | ✅ AWS environment variables |
| **Environments** | ❌ Different setups        | ✅ Same code, different URLs |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Lambda function URL has CORS enabled
   - Check that frontend URL is allowed

2. **Authentication Errors**
   - Verify Metabase credentials in Lambda environment variables
   - Check CloudWatch logs for details

3. **Timeout Errors**
   - Increase Lambda timeout (default: 30 seconds)
   - Check Metabase API response times

### Debugging Steps

1. **Check Lambda Logs**:

   ```bash
   aws logs tail /aws/lambda/metabase-proxy-dev --follow
   ```

2. **Test Endpoints**:

   ```bash
   curl "https://your-lambda-url/metabase/dashboard"
   curl "https://your-lambda-url/metabase/users"
   ```

3. **Verify Environment Variables**:
   - Check Lambda console for correct values
   - Ensure no typos in URLs or credentials

## Next Steps

1. **Deploy Lambda function** using the provided script
2. **Update Amplify environment variables** with the Lambda URL
3. **Test the integration** in your dashboard
4. **Deploy to staging/production** when ready

## Cost Estimation

- **Lambda**: ~$0.20 per million requests
- **Data transfer**: ~$0.09 per GB
- **Estimated monthly cost**: $1-5 for typical usage

## Security Notes

- ✅ Metabase credentials stored in AWS environment variables
- ✅ No credentials exposed to frontend
- ✅ Lambda function URL can be restricted by IP if needed
- ✅ CORS configured for your domain

---

**Ready to deploy?** Run `cd lambda && ./deploy.sh dev` to get started!
