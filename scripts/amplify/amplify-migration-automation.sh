#!/bin/bash

# Enhanced Amplify Migration Automation Script
# This script automates as much of the Amplify region migration as possible

set -e

echo "🚀 Enhanced Amplify Migration Automation"
echo "========================================"

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

# Configuration
SOURCE_REGION="us-east-1"
TARGET_REGION="us-west-1"
BACKUP_DIR="./migration-backup-$(date +%Y%m%d-%H%M%S)"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not authenticated. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Get user input
get_user_input() {
    echo ""
    print_warning "MIGRATION CONFIGURATION"
    echo "=========================="
    
    read -p "Enter your current Amplify App ID (from us-east-1): " SOURCE_APP_ID
    if [ -z "$SOURCE_APP_ID" ]; then
        print_error "Amplify App ID is required."
        exit 1
    fi
    
    read -p "Enter your GitHub repository URL (e.g., https://github.com/smeed652/everybite-app-admin): " GITHUB_REPO
    if [ -z "$GITHUB_REPO" ]; then
        print_error "GitHub repository URL is required."
        exit 1
    fi
    
    read -p "Enter your custom domain (e.g., admin-staging.everybite.com): " CUSTOM_DOMAIN
    if [ -z "$CUSTOM_DOMAIN" ]; then
        print_warning "No custom domain provided. Will use Amplify default domain."
    fi
    
    echo ""
    print_status "Configuration:"
    echo "  Source App ID: $SOURCE_APP_ID"
    echo "  Source Region: $SOURCE_REGION"
    echo "  Target Region: $TARGET_REGION"
    echo "  GitHub Repo: $GITHUB_REPO"
    echo "  Custom Domain: $CUSTOM_DOMAIN"
    echo ""
    
    read -p "Do you want to proceed with this configuration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Migration cancelled."
        exit 0
    fi
}

# Create backup directory
create_backup() {
    print_status "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
}

# Export current Amplify configuration
export_amplify_config() {
    print_status "Exporting current Amplify configuration..."
    
    # Export app configuration
    if aws amplify get-app --app-id "$SOURCE_APP_ID" --region "$SOURCE_REGION" > "$BACKUP_DIR/app-config.json" 2>/dev/null; then
        print_success "✅ App configuration exported"
    else
        print_error "❌ Failed to export app configuration"
        return 1
    fi
    
    # Export environment variables
    if aws amplify list-environments --app-id "$SOURCE_APP_ID" --region "$SOURCE_REGION" > "$BACKUP_DIR/environments.json" 2>/dev/null; then
        print_success "✅ Environment configuration exported"
    else
        print_error "❌ Failed to export environment configuration"
        return 1
    fi
    
    # Export branch configuration
    if aws amplify get-branch --app-id "$SOURCE_APP_ID" --branch-name main --region "$SOURCE_REGION" > "$BACKUP_DIR/branch-config.json" 2>/dev/null; then
        print_success "✅ Branch configuration exported"
    else
        print_error "❌ Failed to export branch configuration"
        return 1
    fi
    
    # Extract environment variables
    jq -r '.environments[].environmentVariables | to_entries[] | "\(.key)=\(.value)"' "$BACKUP_DIR/environments.json" > "$BACKUP_DIR/env-vars.txt" 2>/dev/null || true
}

# Export Lambda functions
export_lambda_config() {
    print_status "Exporting Lambda function configurations..."
    
    # List Lambda functions in source region
    aws lambda list-functions --region "$SOURCE_REGION" --query 'Functions[?contains(FunctionName, `metabase-proxy`)].{Name:FunctionName,Description:Description}' --output json > "$BACKUP_DIR/lambda-functions-source.json"
    
    # List Lambda functions in target region
    aws lambda list-functions --region "$TARGET_REGION" --query 'Functions[?contains(FunctionName, `metabase-proxy`)].{Name:FunctionName,Description:Description}' --output json > "$BACKUP_DIR/lambda-functions-target.json"
    
    print_success "✅ Lambda configurations exported"
}

# Verify target region resources
verify_target_resources() {
    print_status "Verifying resources in target region..."
    
    # Check Cognito User Pool
    if aws cognito-idp describe-user-pool --user-pool-id us-west-1_HuVwywmH1 --region "$TARGET_REGION" &> /dev/null; then
        print_success "✅ Cognito User Pool exists in $TARGET_REGION"
    else
        print_error "❌ Cognito User Pool not found in $TARGET_REGION"
        return 1
    fi
    
    # Check if Lambda functions exist in target region
    TARGET_FUNCTIONS=$(jq -r '.[].Name' "$BACKUP_DIR/lambda-functions-target.json" 2>/dev/null || echo "")
    if [ -n "$TARGET_FUNCTIONS" ]; then
        print_warning "⚠️  Lambda functions already exist in $TARGET_REGION:"
        echo "$TARGET_FUNCTIONS"
        read -p "Do you want to redeploy them? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            REDEPLOY_LAMBDA=true
        else
            REDEPLOY_LAMBDA=false
        fi
    else
        REDEPLOY_LAMBDA=true
    fi
}

# Deploy Lambda functions to target region
deploy_lambda_functions() {
    if [ "$REDEPLOY_LAMBDA" = true ]; then
        print_status "Deploying Lambda functions to $TARGET_REGION..."
        
        export AWS_REGION="$TARGET_REGION"
        
        cd lambda
        for env in dev staging production; do
            print_status "Deploying metabase-proxy-$env..."
            if ./deploy.sh "$env"; then
                print_success "✅ Successfully deployed metabase-proxy-$env"
            else
                print_error "❌ Failed to deploy metabase-proxy-$env"
                return 1
            fi
        done
        cd ..
        
        # Get new function URLs
        print_status "Getting new Lambda function URLs..."
        for env in dev staging production; do
            FUNCTION_URL=$(aws lambda get-function-url-config \
                --function-name "metabase-proxy-$env" \
                --region "$TARGET_REGION" \
                --query 'FunctionUrl' \
                --output text 2>/dev/null || echo "Not found")
            echo "  $env: $FUNCTION_URL" > "$BACKUP_DIR/lambda-urls-$env.txt"
        done
    else
        print_warning "Skipping Lambda deployment (user choice)"
    fi
}

# Generate Amplify app creation commands
generate_amplify_commands() {
    print_status "Generating Amplify app creation commands..."
    
    cat > "$BACKUP_DIR/create-amplify-app.sh" << 'EOF'
#!/bin/bash

# Generated Amplify App Creation Script
# Run this script to create the new Amplify app in us-west-1

set -e

echo "Creating new Amplify app in us-west-1..."

# Create the app
APP_ID=$(aws amplify create-app \
    --name "everybite-app-admin" \
    --repository "https://github.com/smeed652/everybite-app-admin" \
    --region us-west-1 \
    --query 'app.appId' \
    --output text)

echo "Created Amplify app: $APP_ID"

# Create main branch
aws amplify create-branch \
    --app-id "$APP_ID" \
    --branch-name main \
    --region us-west-1

echo "Created main branch"

# Set environment variables
aws amplify update-app \
    --app-id "$APP_ID" \
    --environment-variables file://env-vars.json \
    --region us-west-1

echo "Set environment variables"

echo "✅ Amplify app creation complete!"
echo "App ID: $APP_ID"
echo ""
echo "Next steps:"
echo "1. Go to AWS Amplify Console in us-west-1"
echo "2. Configure custom domain if needed"
echo "3. Set up deployment gates if needed"
echo "4. Test the application"
EOF

    chmod +x "$BACKUP_DIR/create-amplify-app.sh"
    
    # Generate environment variables JSON
    cat > "$BACKUP_DIR/env-vars.json" << EOF
{
  "VITE_AWS_REGION": "us-west-1",
  "VITE_COGNITO_USER_POOL_ID": "us-west-1_HuVwywmH1",
  "VITE_COGNITO_APP_CLIENT_ID": "[YOUR_APP_CLIENT_ID]",
  "VITE_GRAPHQL_URI": "[YOUR_GRAPHQL_URI]",
  "VITE_METABASE_API_URL": "[NEW_LAMBDA_FUNCTION_URL]",
  "VITE_LOG_LEVEL": "info",
  "VITE_SENTRY_DSN": "[YOUR_SENTRY_DSN]"
}
EOF

    print_success "✅ Generated Amplify creation script"
}

# Generate manual steps guide
generate_manual_guide() {
    print_status "Generating manual steps guide..."
    
    cat > "$BACKUP_DIR/MANUAL_STEPS.md" << EOF
# Manual Steps for Amplify Migration

## Step 1: Create New Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/home?region=us-west-1)
2. Click "New app" → "Host web app"
3. Connect to GitHub repository: $GITHUB_REPO
4. Configure build settings (use existing \`amplify.yml\`)
5. Deploy initial build

## Step 2: Configure Environment Variables

Use the values from \`env-vars.json\` in this directory, but replace the placeholder values:

- \`[YOUR_APP_CLIENT_ID]\`: Your Cognito App Client ID
- \`[YOUR_GRAPHQL_URI]\`: Your GraphQL API endpoint
- \`[NEW_LAMBDA_FUNCTION_URL]\`: Use the URLs from \`lambda-urls-*.txt\` files
- \`[YOUR_SENTRY_DSN]\`: Your Sentry DSN

## Step 3: Set Up Custom Domain

If you specified a custom domain: $CUSTOM_DOMAIN

1. Go to App settings → Domain management
2. Add custom domain: $CUSTOM_DOMAIN
3. Verify domain ownership
4. Configure SSL certificate
5. Update DNS records if needed

## Step 4: Configure Deployment Gates (Optional)

1. Go to App settings → Build settings
2. Enable deployment gates
3. Add GitHub status check gate
4. Configure branch protection

## Step 5: Test the Application

1. Run smoke tests: \`npm run test:e2e:smoke\`
2. Test login functionality
3. Test user management features
4. Test SmartMenu features
5. Test Metabase integration

## Step 6: Update DNS (If Using Custom Domain)

Update your DNS records to point to the new Amplify app.

## Step 7: Clean Up

After confirming everything works:

1. Delete old Lambda functions in us-east-1
2. Delete old Amplify app in us-east-1
3. Update documentation

## Backup Files

This directory contains:
- \`app-config.json\`: Original app configuration
- \`environments.json\`: Original environment configuration
- \`branch-config.json\`: Original branch configuration
- \`env-vars.json\`: Environment variables template
- \`lambda-urls-*.txt\`: New Lambda function URLs
- \`create-amplify-app.sh\`: Automated app creation script
EOF

    print_success "✅ Generated manual steps guide"
}

# Main execution
main() {
    echo ""
    print_warning "This script will help automate the Amplify migration process."
    print_warning "Some steps still require manual intervention in the AWS Console."
    echo ""
    
    check_prerequisites
    get_user_input
    create_backup
    export_amplify_config
    export_lambda_config
    verify_target_resources
    deploy_lambda_functions
    generate_amplify_commands
    generate_manual_guide
    
    echo ""
    print_success "Migration automation complete!"
    echo ""
    print_status "Backup directory: $BACKUP_DIR"
    echo ""
    print_warning "Next steps:"
    echo "1. Review the backup files in: $BACKUP_DIR"
    echo "2. Update the environment variables in: $BACKUP_DIR/env-vars.json"
    echo "3. Follow the manual steps in: $BACKUP_DIR/MANUAL_STEPS.md"
    echo "4. Run the automated app creation: $BACKUP_DIR/create-amplify-app.sh"
    echo ""
    print_status "The migration is approximately 70% automated!"
}

# Run main function
main "$@" 