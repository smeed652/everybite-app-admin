#!/bin/bash

# Deploy Metabase Proxy Lambda Function
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-dev}
FUNCTION_NAME="metabase-proxy-${ENVIRONMENT}"
REGION=${AWS_REGION:-us-east-1}

echo "Deploying Metabase Proxy Lambda Function..."
echo "Environment: $ENVIRONMENT"
echo "Function Name: $FUNCTION_NAME"
echo "Region: $REGION"

# Navigate to Lambda function directory
cd metabase-proxy

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Create deployment package
echo "Creating deployment package..."
npm run package

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo "Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://metabase-proxy.zip \
        --region $REGION
else
    echo "Creating new function..."
    # Create the function (you'll need to set up IAM role first)
    echo "Please create the Lambda function manually in AWS Console or use AWS CLI with proper IAM role"
    echo "Function name: $FUNCTION_NAME"
    echo "Runtime: nodejs18.x"
    echo "Handler: index.handler"
    echo "Timeout: 30 seconds"
    echo "Memory: 256 MB"
fi

# Update environment variables
echo "Updating environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{
        METABASE_URL=https://analytics.everybite.com,
        METABASE_USERNAME=sid@everybite.com,
        METABASE_PASSWORD=wH3R4f?Lbot5Ir
    }" \
    --region $REGION

# Get function URL
echo "Getting function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name $FUNCTION_NAME \
    --region $REGION \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo "Creating function URL..."
    aws lambda create-function-url-config \
        --function-name $FUNCTION_NAME \
        --auth-type NONE \
        --region $REGION
    
    FUNCTION_URL=$(aws lambda get-function-url-config \
        --function-name $FUNCTION_NAME \
        --region $REGION \
        --query 'FunctionUrl' \
        --output text)
fi

echo "✅ Deployment complete!"
echo "Function URL: $FUNCTION_URL"
echo ""
echo "Test endpoints:"
echo "  Dashboard: $FUNCTION_URL/metabase/dashboard"
echo "  Users: $FUNCTION_URL/metabase/users"

# Clean up
rm -f metabase-proxy.zip
cd ..

echo ""
echo "Next steps:"
echo "1. Update your frontend environment variables with the function URL"
echo "2. Test the endpoints"
echo "3. Deploy to staging/production by running: ./deploy.sh staging" 