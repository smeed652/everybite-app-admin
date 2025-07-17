#!/bin/bash

# Set API Key for Lambda function
FUNCTION_NAME="metabase-proxy-dev"
REGION="us-west-1"

# Generate a secure API key (you can change this to your preferred key)
API_KEY="eb-analytics-$(openssl rand -hex 16)"

echo "Setting API Key for Lambda function..."
echo "Function: $FUNCTION_NAME"
echo "API Key: $API_KEY"

# Update Lambda environment variables
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{
        METABASE_URL=https://analytics.everybite.com,
        METABASE_USERNAME=sid@everybite.com,
        METABASE_PASSWORD=wH3R4f?Lbot5Ir,
        API_KEY=$API_KEY
    }" \
    --region $REGION

echo ""
echo "✅ API Key set successfully!"
echo ""
echo "📝 Use this API Key in your requests:"
echo "   X-API-Key: $API_KEY"
echo ""
echo "🔒 Keep this API key secure and don't commit it to version control!" 