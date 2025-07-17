#!/bin/bash

echo "Checking current environment variables for Lambda function..."

# Get the current environment variables
aws lambda get-function-configuration \
  --function-name metabase-proxy-dev \
  --region us-west-1 \
  --query 'Environment.Variables' \
  --output table

echo ""
echo "Required environment variables:"
echo "- METABASE_URL (for Metabase API calls)"
echo "- METABASE_USERNAME (for Metabase authentication)"
echo "- METABASE_PASSWORD (for Metabase authentication)"
echo "- COGNITO_USER_POOL_ID (for Cognito user management)"
echo ""
echo "If any are missing, you'll need to set them in the AWS Console:"
echo "1. Go to Lambda → metabase-proxy-dev → Configuration → Environment variables"
echo "2. Add the missing variables" 