#!/bin/bash

# Simple Two-Branch Workflow Script
# main -> production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_clean_working_dir() {
    if [[ -n $(git status --porcelain) ]]; then
        print_error "Working directory is not clean. Please commit or stash your changes."
        exit 1
    fi
}

# Function to deploy to production from main
deploy_production() {
    print_header "Deploying to Production"
    
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"
    
    check_clean_working_dir
    
    # Ensure we're on main
    if [[ "$current_branch" != "main" ]]; then
        print_status "Switching to main branch..."
        git checkout main
    fi
    
    # Update main from remote
    print_status "Updating main from remote..."
    git pull origin main
    
    # Run tests and build
    print_status "Running tests and build..."
    npm run test
    npm run build
    
    # Get changes summary
    local changes_summary=$(git log --oneline main ^production | head -5 | sed 's/^/  - /')
    
    if [[ -z "$changes_summary" ]]; then
        print_success "No new changes to deploy. Production is up to date."
        return 0
    fi
    
    print_status "Changes to deploy:"
    echo "$changes_summary"
    
    # Confirm deployment
    echo
    read -p "Deploy these changes to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        return 0
    fi
    
    # Switch to production and merge
    print_status "Switching to production branch..."
    git checkout production
    
    print_status "Merging main into production..."
    git merge main --no-edit
    
    # Push to production
    print_status "Pushing to production..."
    git push origin production
    
    print_success "Production deployment complete!"
    
    # Switch back to main
    print_status "Switching back to main..."
    git checkout main
}

# Function to show help
show_help() {
    echo "Simple Two-Branch Workflow"
    echo
    echo "Usage: $0 <command>"
    echo
    echo "Commands:"
    echo "  deploy-production    - Deploy main to production"
    echo "  help                 - Show this help message"
    echo
    echo "Workflow:"
    echo "  1. Work on main branch"
    echo "  2. Run: $0 deploy-production"
    echo "  3. Production auto-deploys"
}

# Main script logic
case "${1:-help}" in
    "deploy-production")
        deploy_production
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac 