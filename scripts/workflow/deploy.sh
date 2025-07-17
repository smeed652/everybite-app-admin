#!/bin/bash

set -e

# Update versioning and deployment info in env-vars.json
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DEPLOY_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LAMBDA_VERSION="pending"
ENVIRONMENT=${1:-dev}

# Update env-vars.json with deployment info
jq \
  --arg v "$LAMBDA_VERSION" \
  --arg c "$GIT_COMMIT" \
  --arg t "$DEPLOY_TIMESTAMP" \
  --arg e "$ENVIRONMENT" \
  '.Variables.LAMBDA_VERSION = $v | .Variables.GIT_COMMIT = $c | .Variables.DEPLOY_TIMESTAMP = $t | .Variables.ENVIRONMENT = $e' \
  metabase-proxy/env-vars.json > metabase-proxy/env-vars.json.tmp && mv metabase-proxy/env-vars.json.tmp metabase-proxy/env-vars.json


echo "Deploying Metabase Proxy Lambda Function..."
echo "Environment: $ENVIRONMENT"
echo "Function Name: $FUNCTION_NAME"
echo "Region: $REGION"
echo "Deploy Timestamp: $DEPLOY_TIMESTAMP"
echo "Git Commit: $GIT_COMMIT"

cd metabase-proxy

echo "Installing dependencies..."
npm install --production

echo "Creating deployment package..."
npm run package

if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
    echo "Updating existing function code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://metabase-proxy.zip \
        --region "$REGION"
    echo "Waiting for function code update to complete..."
    aws lambda wait function-updated \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION"
else
    echo "Function does not exist. Please create it manually in AWS Console or with AWS CLI."
    echo "Function name: $FUNCTION_NAME"
    echo "Runtime: nodejs18.x"
    echo "Handler: index.handler"
    exit 1
fi

echo "Updating environment variables..."
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment file://env-vars.json \
    --region "$REGION"

echo "Waiting for function configuration update to complete..."
aws lambda wait function-updated \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION"

echo "Publishing new version..."
VERSION_NUMBER=$(aws lambda publish-version \
    --function-name "$FUNCTION_NAME" \
    --description "Deploy $DEPLOY_TIMESTAMP - Git: $GIT_COMMIT" \
    --region "$REGION" \
    --query 'Version' \
    --output text)

echo "Published version: $VERSION_NUMBER"

ALIAS_NAME="latest"
echo "Updating alias '$ALIAS_NAME' to version $VERSION_NUMBER..."

if aws lambda get-alias --function-name "$FUNCTION_NAME" --name "$ALIAS_NAME" --region "$REGION" >/dev/null 2>&1; then
    aws lambda update-alias \
        --function-name "$FUNCTION_NAME" \
        --name "$ALIAS_NAME" \
        --function-version "$VERSION_NUMBER" \
        --region "$REGION"
else
    aws lambda create-alias \
        --function-name "$FUNCTION_NAME" \
        --name "$ALIAS_NAME" \
        --function-version "$VERSION_NUMBER" \
        --region "$REGION"
fi

echo "Alias '$ALIAS_NAME' updated to version $VERSION_NUMBER"

echo "Getting function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --query 'FunctionUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo "Creating function URL..."
    aws lambda create-function-url-config \
        --function-name "$FUNCTION_NAME" \
        --auth-type NONE \
        --region "$REGION"
    FUNCTION_URL=$(aws lambda get-function-url-config \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION" \
        --query 'FunctionUrl' \
        --output text)
fi

echo "Deployment complete!"
echo "Function URL: $FUNCTION_URL"
echo "Current Version: $VERSION_NUMBER"
echo "Deploy Timestamp: $DEPLOY_TIMESTAMP"
echo "Git Commit: $GIT_COMMIT"
echo ""
echo "Test endpoints:"
echo "  GraphQL: $FUNCTION_URL/graphql"
echo "  Dashboard: $FUNCTION_URL/metabase/dashboard"
echo "  Users: $FUNCTION_URL/metabase/users"

rm -f metabase-proxy.zip
cd ..

echo ""
echo "Next steps:"
echo "1. Update your frontend environment variables with the function URL"
echo "2. Test the GraphQL endpoint with API key"
echo "3. Deploy to staging/production by running: ./deploy.sh staging"