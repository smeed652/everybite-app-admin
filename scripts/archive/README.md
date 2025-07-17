# Metabase Proxy Lambda Function

This Lambda function provides a secure proxy for Metabase API calls, allowing your frontend to access Metabase data without exposing credentials or dealing with CORS issues.

## Features

- ✅ **Secure**: Credentials stored in AWS environment variables
- ✅ **CORS-enabled**: Works with frontend applications
- ✅ **Session Management**: Handles Metabase authentication automatically
- ✅ **Multi-environment**: Works in dev, staging, and production
- ✅ **Cost-effective**: Pay only for actual usage

## Endpoints

- `GET /metabase/dashboard` - Returns aggregated dashboard metrics
- `GET /metabase/users` - Returns user list with account details

## Deployment

### Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Node.js 18+** installed
3. **AWS credentials** with Lambda permissions

### Quick Deploy

```bash
# Deploy to dev environment
cd lambda
chmod +x deploy.sh
./deploy.sh dev

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production
```

### Manual Deployment

1. **Create Lambda Function** in AWS Console:
   - Runtime: Node.js 18.x
   - Handler: index.handler
   - Timeout: 30 seconds
   - Memory: 256 MB

2. **Set Environment Variables**:

   ```
   METABASE_URL=https://analytics.everybite.com
   METABASE_USERNAME=sid@everybite.com
   METABASE_PASSWORD=wH3R4f?Lbot5Ir
   ```

3. **Package and Deploy**:

   ```bash
   cd lambda/metabase-proxy
   npm install --production
   npm run package
   # Upload metabase-proxy.zip to Lambda
   ```

4. **Create Function URL**:
   - Auth type: NONE
   - Enable CORS

## Environment Configuration

### Frontend Environment Variables

Set these in your Amplify environment or `.env` files:

```bash
# Development
VITE_METABASE_API_URL=http://localhost:4000

# Staging
VITE_METABASE_API_URL=https://your-lambda-function-url-staging.amazonaws.com

# Production
VITE_METABASE_API_URL=https://your-lambda-function-url-production.amazonaws.com
```

### Amplify Environment Variables

In AWS Amplify Console, set:

```
VITE_METABASE_API_URL=https://your-lambda-function-url.amazonaws.com
```

## Testing

### Test Lambda Function

```bash
# Test dashboard endpoint
curl "https://your-lambda-function-url.amazonaws.com/metabase/dashboard"

# Test users endpoint
curl "https://your-lambda-function-url.amazonaws.com/metabase/users"
```

### Test Frontend Integration

1. Start your frontend development server
2. Navigate to the Dashboard page
3. Check browser network tab for API calls
4. Verify data is loading correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Lambda function URL is configured with CORS
2. **Authentication Errors**: Check Metabase credentials in environment variables
3. **Timeout Errors**: Increase Lambda timeout if needed
4. **Memory Errors**: Increase Lambda memory allocation

### Debugging

1. **Check Lambda Logs** in CloudWatch
2. **Test endpoints directly** with curl
3. **Verify environment variables** are set correctly
4. **Check network requests** in browser dev tools

## Security Considerations

- ✅ Credentials stored in AWS environment variables
- ✅ No credentials exposed to frontend
- ✅ CORS configured for specific origins
- ✅ Lambda function URL can be restricted by IP if needed

## Cost Optimization

- **Memory**: 256 MB is sufficient for most use cases
- **Timeout**: 30 seconds should be adequate
- **Concurrency**: Consider setting limits for high-traffic scenarios
- **Caching**: Lambda maintains session tokens to reduce API calls

## Monitoring

- **CloudWatch Logs**: Monitor function execution
- **CloudWatch Metrics**: Track invocation count, duration, errors
- **X-Ray**: Enable for detailed tracing (optional)

## Support

For issues or questions:

1. Check CloudWatch logs first
2. Test endpoints directly
3. Verify environment configuration
4. Review this README for common solutions
