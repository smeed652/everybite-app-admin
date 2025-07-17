#!/bin/bash

# Set the Cognito User Pool ID environment variable
# Replace "us-west-1_YOUR_USER_POOL_ID" with your actual User Pool ID

echo "Setting Cognito User Pool ID environment variable..."

aws lambda update-function-configuration \
  --function-name metabase-proxy-dev \
  --environment Variables='{COGNITO_USER_POOL_ID="us-west-1_HuVwywmH1"}' \
  --region us-west-1

echo "Environment variable set successfully!"
echo ""
echo "To find your User Pool ID, run:"
echo "aws cognito-idp list-user-pools --max-results 10 --region us-west-1" 