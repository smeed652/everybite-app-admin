#!/bin/bash

# Deployment Validation Script
# Usage: ./scripts/deploy-validation.sh [environment]

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

# Function to check if tests pass
run_tests() {
    print_header "Running Tests"
    
    print_status "Running unit tests..."
    npm test -- --coverage --passWithNoTests
    
    print_status "All tests passed!"
}

# Function to check build
check_build() {
    print_header "Checking Build"
    
    print_status "Building application..."
    npm run build
    
    print_status "Build successful!"
}

# Function to check environment variables
check_env_vars() {
    local environment=$1
    
    print_header "Checking Environment Variables"
    
    # Check if required env vars are set
    local required_vars=(
        "VITE_AWS_REGION"
        "VITE_COGNITO_USER_POOL_ID"
        "VITE_COGNITO_APP_CLIENT_ID"
        "VITE_GRAPHQL_URI"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Environment variable $var is not set"
        else
            print_status "$var is set"
        fi
    done
}

# Function to validate YAML and npm scripts for Amplify compatibility
validate_amplify_compatibility() {
    print_header "Validating Amplify Compatibility"
    
    # Check for unescaped colons in package.json scripts
    print_status "Checking for unescaped colons in npm scripts..."
    
    # Look for URLs with colons that aren't properly quoted
    local unescaped_urls=$(grep -n '"test-stories"' package.json | grep -E 'http://[^"]*:[^"]*' | grep -v "'http://" | grep -v '"http://')
    
    if [ -n "$unescaped_urls" ]; then
        print_error "Found unescaped URLs with colons in package.json:"
        echo "$unescaped_urls"
        print_error "Please quote all URLs containing colons. See docs/active/AMPLIFY-YAML-RULES.md"
        exit 1
    fi
    
    # Check for other potential colon issues in scripts
    local colon_issues=$(grep -n '"scripts"' -A 20 package.json | grep -E ':[0-9]+' | grep -v '"[0-9]*"' | grep -v "'[0-9]*'")
    
    if [ -n "$colon_issues" ]; then
        print_warning "Found potential colon issues in scripts:"
        echo "$colon_issues"
        print_warning "Please verify these are properly quoted for YAML compatibility"
    fi
    
    # Validate amplify.yml syntax
    print_status "Validating amplify.yml syntax..."
    if command -v yamllint >/dev/null 2>&1; then
        if yamllint amplify.yml >/dev/null 2>&1; then
            print_status "amplify.yml syntax is valid"
        else
            print_error "amplify.yml has syntax errors"
            yamllint amplify.yml
            exit 1
        fi
    else
        print_warning "yamllint not installed, skipping amplify.yml validation"
    fi
    
    print_status "Amplify compatibility validation passed!"
}

# Function to validate deployment
validate_deployment() {
    local environment=$1
    
    print_header "Validating Deployment for $environment"
    
    # Validate Amplify compatibility first
    validate_amplify_compatibility
    
    # Run tests
    run_tests
    
    # Check build
    check_build
    
    # Check environment variables
    check_env_vars "$environment"
    
    # Additional environment-specific checks
    case $environment in
        "production")
            print_status "Production deployment validation complete"
            print_warning "Remember to:"
            echo "  - Review all changes in staging first"
            echo "  - Ensure all tests pass"
            echo "  - Check monitoring and alerting"
            echo "  - Have rollback plan ready"
            ;;
        "staging")
            print_status "Staging deployment validation complete"
            print_warning "Remember to:"
            echo "  - Test all features thoroughly"
            echo "  - Run E2E tests against staging"
            echo "  - Verify environment variables"
            ;;
        "develop")
            print_status "Development deployment validation complete"
            ;;
        *)
            print_error "Unknown environment: $environment"
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    print_header "Deployment Validation Script"
    
    echo "Usage: ./scripts/deploy-validation.sh [environment]"
    echo ""
    echo "Environments:"
    echo "  develop     - Development environment"
    echo "  staging     - Staging environment"
    echo "  production  - Production environment"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-validation.sh staging"
    echo "  ./scripts/deploy-validation.sh production"
}

# Main script logic
case "$1" in
    "develop"|"staging"|"production")
        validate_deployment "$1"
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown environment: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 