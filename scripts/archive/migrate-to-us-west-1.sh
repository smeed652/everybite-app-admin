#!/bin/bash

# Migration Script: Move Everything to us-west-1 (Northern California)
# This script helps migrate your Amplify app and related resources to us-west-1

set -e

echo "🔧 Migration to us-west-1 (Northern California)"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI is not authenticated. Please run 'aws configure' first."
    exit 1
fi

print_status "Current AWS Account: $(aws sts get-caller-identity --query 'Account' --output text)"
print_status "Current AWS Region: $(aws configure get region)"

echo ""
print_warning "MIGRATION PLAN"
echo "================"
echo "1. ✅ Cognito User Pool: Already in us-west-1"
echo "2. ✅ Lambda Functions: Will be redeployed to us-west-1"
echo "3. ⚠️  Amplify App: Needs to be recreated in us-west-1"
echo "4. ⚠️  Custom Domain: Needs to be reconfigured"
echo ""

read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Migration cancelled."
    exit 0
fi

echo ""
print_status "Step 1: Verifying current resources in us-west-1..."

# Check Cognito User Pool
if aws cognito-idp describe-user-pool --user-pool-id us-west-1_HuVwywmH1 --region us-west-1 &> /dev/null; then
    print_success "✅ Cognito User Pool exists in us-west-1"
else
    print_error "❌ Cognito User Pool not found in us-west-1"
    exit 1
fi

# Check Lambda functions
LAMBDA_FUNCTIONS=("metabase-proxy-dev" "metabase-proxy-staging" "metabase-proxy-production")
for func in "${LAMBDA_FUNCTIONS[@]}"; do
    if aws lambda get-function --function-name "$func" --region us-west-1 &> /dev/null; then
        print_success "✅ Lambda function $func exists in us-west-1"
    else
        print_warning "⚠️  Lambda function $func not found in us-west-1 (will be created)"
    fi
done

echo ""
print_status "Step 2: Redeploying Lambda functions to us-west-1..."

# Set AWS region for deployment
export AWS_REGION=us-west-1

# Deploy Lambda functions
cd lambda
for env in dev staging production; do
    print_status "Deploying metabase-proxy-$env..."
    if ./deploy.sh "$env"; then
        print_success "✅ Successfully deployed metabase-proxy-$env"
    else
        print_error "❌ Failed to deploy metabase-proxy-$env"
        exit 1
    fi
done
cd ..

echo ""
print_warning "Step 3: Amplify App Migration"
echo "===================================="
echo ""
print_warning "IMPORTANT: You need to manually recreate your Amplify app in us-west-1"
echo ""
echo "Follow these steps:"
echo "1. Go to AWS Amplify Console in us-west-1 region"
echo "2. Create a new app and connect your GitHub repository"
echo "3. Configure the following environment variables:"
echo ""
echo "   VITE_AWS_REGION=us-west-1"
echo "   VITE_COGNITO_USER_POOL_ID=us-west-1_HuVwywmH1"
echo "   VITE_COGNITO_APP_CLIENT_ID=[your-app-client-id]"
echo "   VITE_GRAPHQL_URI=[your-graphql-uri]"
echo "   VITE_METABASE_API_URL=[new-lambda-function-url]"
echo "   VITE_LOG_LEVEL=info"
echo "   VITE_SENTRY_DSN=[your-sentry-dsn]"
echo ""
echo "4. Set up your custom domain (admin-staging.everybite.com)"
echo "5. Configure deployment gates if needed"
echo ""

# Get Lambda function URLs
echo "New Lambda Function URLs:"
for env in dev staging production; do
    FUNCTION_URL=$(aws lambda get-function-url-config \
        --function-name "metabase-proxy-$env" \
        --region us-west-1 \
        --query 'FunctionUrl' \
        --output text 2>/dev/null || echo "Not found")
    echo "   $env: $FUNCTION_URL"
done

echo ""
print_warning "Step 4: Update Environment Variables"
echo "============================================"
echo ""
echo "After creating the new Amplify app, update these environment variables:"
echo ""
echo "VITE_METABASE_API_URL should point to your new Lambda function URL"
echo ""

print_success "Migration script completed!"
echo ""
print_warning "Next steps:"
echo "1. Create new Amplify app in us-west-1"
echo "2. Update environment variables"
echo "3. Test the application"
echo "4. Update DNS if needed"
echo "5. Delete old Amplify app in us-east-1 (after confirming everything works)"
echo ""
print_status "All your resources will now be in us-west-1 (Northern California)!" 