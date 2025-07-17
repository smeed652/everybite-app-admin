#!/bin/bash

echo "Setting all required environment variables for unified Lambda function..."

# Set all environment variables including Metabase and Cognito
aws lambda update-function-configuration \
  --function-name metabase-proxy-dev \
  --environment file://env-vars.json \
  --region us-west-1

if [ $? -eq 0 ]; then
    echo "✅ Successfully set all environment variables!"
    echo ""
    echo "Environment variables set:"
    echo "- METABASE_URL: https://analytics.everybite.com"
    echo "- METABASE_USERNAME: sid@everybite.com"
    echo "- METABASE_PASSWORD: [hidden]"
    echo "- COGNITO_USER_POOL_ID: us-west-1_HuVwywmH1"
    echo ""
    echo "Your unified Lambda function now supports both:"
    echo "✅ Metabase API calls (/metabase/*)"
    echo "✅ Cognito user management (/users/*)"
else
    echo "❌ Failed to set environment variables."
    echo "You may need to set them manually in the AWS Console:"
    echo "1. Go to Lambda → metabase-proxy-dev → Configuration → Environment variables"
    echo "2. Add the variables listed above"
fi 