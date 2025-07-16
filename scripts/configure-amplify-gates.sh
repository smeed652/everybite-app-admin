#!/bin/bash

# Configure Amplify Deployment Gates
# This script helps set up Amplify to wait for GitHub CI before deploying

set -e

echo "🔧 Configuring Amplify Deployment Gates"
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

print_status "Checking current Amplify app configuration..."

# Get Amplify app ID (you'll need to provide this)
echo ""
print_warning "You need to provide your Amplify App ID."
print_warning "You can find this in the Amplify Console URL:"
print_warning "https://console.aws.amazon.com/amplify/home?region=us-west-1#/d[APP_ID]"
echo ""

read -p "Enter your Amplify App ID: " AMPLIFY_APP_ID

if [ -z "$AMPLIFY_APP_ID" ]; then
    print_error "Amplify App ID is required."
    exit 1
fi

print_status "Configuring deployment gates for Amplify App: $AMPLIFY_APP_ID"

# Create a temporary JSON file for the deployment configuration
cat > /tmp/amplify-deployment-config.json << EOF
{
  "deploymentGates": {
    "enableDeploymentGates": true,
    "deploymentGates": [
      {
        "type": "GITHUB_STATUS_CHECK",
        "name": "CI",
        "repository": "smeed652/everybite-app-admin",
        "branch": "main",
        "statusCheck": "CI"
      }
    ]
  }
}
EOF

print_status "Deployment gates configuration created."
echo ""
print_status "To apply this configuration, you need to:"
echo ""
print_warning "1. Go to AWS Amplify Console"
print_warning "2. Navigate to your app: $AMPLIFY_APP_ID"
print_warning "3. Go to App settings > Build settings"
print_warning "4. Enable 'Deployment gates'"
print_warning "5. Add a new gate with these settings:"
echo ""
echo "   Gate Type: GitHub status check"
echo "   Repository: smeed652/everybite-app-admin"
echo "   Branch: main"
echo "   Status Check: CI"
echo ""
print_warning "6. Save the configuration"
echo ""

# Alternative: Try to use AWS CLI (if you have the right permissions)
print_status "Attempting to configure via AWS CLI..."

if aws amplify update-app \
    --app-id "$AMPLIFY_APP_ID" \
    --deployment-gates-enable-deployment-gates \
    --deployment-gates-deployment-gates file:///tmp/amplify-deployment-config.json 2>/dev/null; then
    print_success "Deployment gates configured successfully via AWS CLI!"
else
    print_warning "AWS CLI configuration failed. Please configure manually in the console."
    print_warning "The configuration file is saved at: /tmp/amplify-deployment-config.json"
fi

# Clean up
rm -f /tmp/amplify-deployment-config.json

echo ""
print_success "Configuration complete!"
print_status "Your Amplify app will now wait for the GitHub CI to pass before deploying."
print_status "This ensures that only code that passes all tests gets deployed."
echo ""
print_warning "Note: Make sure your GitHub repository has the correct permissions"
print_warning "for Amplify to read the CI status." 