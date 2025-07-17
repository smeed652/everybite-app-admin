#!/bin/bash

# Lambda Deployment with Validation Script
# Usage: ./scripts/deployment/deploy-with-validation.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Configuration
ENVIRONMENT=${1:-dev}
FUNCTION_NAME="metabase-proxy-${ENVIRONMENT}"
REGION="us-west-1"
LAMBDA_URL="https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws"
API_KEY="3SB3ZawcNr3AT11vxKruJ"

# Update versioning and deployment info
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DEPLOY_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LAMBDA_VERSION="pending"

print_header "Lambda Deployment with Validation"
print_status "Environment: $ENVIRONMENT"
print_status "Function Name: $FUNCTION_NAME"
print_status "Region: $REGION"
print_status "Deploy Timestamp: $DEPLOY_TIMESTAMP"
print_status "Git Commit: $GIT_COMMIT"

# Step 1: Update environment variables
print_header "Step 1: Updating Environment Variables"
jq \
  --arg v "$LAMBDA_VERSION" \
  --arg c "$GIT_COMMIT" \
  --arg t "$DEPLOY_TIMESTAMP" \
  --arg e "$ENVIRONMENT" \
  '.Variables.LAMBDA_VERSION = $v | .Variables.GIT_COMMIT = $c | .Variables.DEPLOY_TIMESTAMP = $t | .Variables.ENVIRONMENT = $e' \
  env-vars.json > env-vars.json.tmp && mv env-vars.json.tmp env-vars.json

print_status "Environment variables updated"

# Step 2: Install dependencies and package
print_header "Step 2: Creating Deployment Package"
print_status "Installing dependencies..."
npm install --production

print_status "Creating deployment package..."
npm run package

# Step 3: Deploy to AWS Lambda
print_header "Step 3: Deploying to AWS Lambda"

if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
    print_status "Updating existing function code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://metabase-proxy.zip \
        --region "$REGION"
    
    print_status "Waiting for function code update to complete..."
    aws lambda wait function-updated \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION"
    print_status "Function code update completed"
else
    print_error "Function does not exist. Please create it manually in AWS Console or with AWS CLI."
    print_error "Function name: $FUNCTION_NAME"
    print_error "Runtime: nodejs18.x"
    print_error "Handler: index.handler"
    exit 1
fi

# Step 4: Update environment variables
print_header "Step 4: Updating Environment Variables"
print_status "Updating function configuration..."
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment file://env-vars.json \
    --region "$REGION"

print_status "Waiting for function configuration update to complete..."
aws lambda wait function-updated \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION"
print_status "Function configuration update completed"

# Step 5: Publish new version
print_header "Step 5: Publishing New Version"
VERSION_NUMBER=$(aws lambda publish-version \
    --function-name "$FUNCTION_NAME" \
    --description "Deploy $DEPLOY_TIMESTAMP - Git: $GIT_COMMIT" \
    --region "$REGION" \
    --query 'Version' \
    --output text)

print_status "Published version: $VERSION_NUMBER"

# Step 6: Update alias
print_header "Step 6: Updating Alias"
ALIAS_NAME="latest"
print_status "Updating alias '$ALIAS_NAME' to version $VERSION_NUMBER..."

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

print_status "Alias '$ALIAS_NAME' updated to version $VERSION_NUMBER"

# Step 7: Wait for deployment to be fully ready
print_header "Step 7: Waiting for Deployment to be Ready"
print_status "Waiting 10 seconds for Lambda to be fully ready..."
sleep 10

# Step 8: Validate deployment
print_header "Step 8: Validating Deployment"

# Test basic connectivity
print_status "Testing basic connectivity..."
if curl -s -f "$LAMBDA_URL/graphql" >/dev/null 2>&1; then
    print_status "✅ Lambda function is responding"
else
    print_warning "⚠️  Lambda function requires API key for access"
fi

# Test GraphQL endpoint
print_status "Testing GraphQL endpoint..."
TEST_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d '{"query":"query { info { lambdaVersion environment } }"}' \
    "$LAMBDA_URL/graphql" 2>/dev/null || echo "")

if echo "$TEST_RESPONSE" | grep -q "lambdaVersion"; then
    print_status "✅ GraphQL endpoint is working"
    LAMBDA_VERSION_ACTUAL=$(echo "$TEST_RESPONSE" | jq -r '.data.info.lambdaVersion' 2>/dev/null || echo "unknown")
    print_status "Lambda Version: $LAMBDA_VERSION_ACTUAL"
else
    print_error "❌ GraphQL endpoint test failed"
    print_error "Response: $TEST_RESPONSE"
    exit 1
fi

# Step 9: Run comprehensive tests
print_header "Step 9: Running Comprehensive Tests"
print_status "Running quarterly metrics test..."
if node scripts/testing/test-quarterly-metrics-refactored.js; then
    print_status "✅ All tests passed"
else
    print_error "❌ Tests failed"
    exit 1
fi

# Step 10: Cleanup and summary
print_header "Step 10: Deployment Summary"
print_status "Deployment complete!"
print_status "Function URL: $LAMBDA_URL"
print_status "Current Version: $VERSION_NUMBER"
print_status "Deploy Timestamp: $DEPLOY_TIMESTAMP"
print_status "Git Commit: $GIT_COMMIT"
print_status "Environment: $ENVIRONMENT"

echo ""
print_status "Test endpoints:"
echo "  GraphQL: $LAMBDA_URL/graphql"
echo "  Dashboard: $LAMBDA_URL/metabase/dashboard"
echo "  Users: $LAMBDA_URL/metabase/users"

# Cleanup
rm -f metabase-proxy.zip

echo ""
print_status "Next steps:"
echo "1. Update your frontend environment variables with the function URL"
echo "2. Test the GraphQL endpoint with API key"
echo "3. Deploy to staging/production by running: ./scripts/deployment/deploy-with-validation.sh staging"

print_header "Deployment Complete! 🎉" 