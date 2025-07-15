#!/bin/bash

# Get the Lambda function URL
FUNCTION_NAME="metabase-proxy-dev"

echo "Getting function URL for: $FUNCTION_NAME"

# Get the function URL
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name $FUNCTION_NAME \
    --query 'FunctionUrl' \
    --output text 2>/dev/null)

if [ $? -eq 0 ] && [ ! -z "$FUNCTION_URL" ]; then
    echo "✅ Function URL: $FUNCTION_URL"
    echo ""
    echo "Test endpoints:"
    echo "  Dashboard: $FUNCTION_URL/metabase/dashboard"
    echo "  Users: $FUNCTION_URL/metabase/users"
    echo ""
    echo "Add this to your Amplify environment variables:"
    echo "VITE_METABASE_API_URL=$FUNCTION_URL"
else
    echo "❌ Could not get function URL"
    echo "Please check the AWS Lambda console for the function URL"
fi 