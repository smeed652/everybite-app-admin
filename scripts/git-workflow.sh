#!/bin/bash

# Git Workflow Script for EveryBite App Admin
# Usage: ./scripts/git-workflow.sh [command] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if we're on the correct branch
check_branch() {
    local expected_branch=$1
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" != "$expected_branch" ]; then
        print_error "You must be on the '$expected_branch' branch. Current branch: $current_branch"
        exit 1
    fi
}

# Function to check if working directory is clean
check_clean_working_dir() {
    if ! git diff-index --quiet HEAD --; then
        print_error "Working directory is not clean. Please commit or stash your changes."
        exit 1
    fi
}

# Function to update branch from remote
update_branch() {
    local branch=$1
    print_status "Updating $branch from remote..."
    git fetch origin
    git checkout $branch
    git pull origin $branch
}

# Function to create feature branch
create_feature() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        print_error "Feature name is required. Usage: ./scripts/git-workflow.sh create-feature <feature-name>"
        exit 1
    fi
    
    print_header "Creating feature branch"
    
    # Ensure we're on develop and it's up to date
    update_branch "develop"
    
    # Create and checkout feature branch
    local feature_branch="feature/$feature_name"
    git checkout -b $feature_branch
    
    print_status "Created feature branch: $feature_branch"
    print_status "You can now start developing your feature"
}

# Function to finish feature
finish_feature() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        print_error "Feature name is required. Usage: ./scripts/git-workflow.sh finish-feature <feature-name>"
        exit 1
    fi
    
    print_header "Finishing feature branch"
    
    local feature_branch="feature/$feature_name"
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" != "$feature_branch" ]; then
        print_error "You must be on the feature branch: $feature_branch"
        exit 1
    fi
    
    check_clean_working_dir
    
    # Update develop branch
    update_branch "develop"
    
    # Merge feature branch
    git merge --no-ff $feature_branch -m "feat: merge $feature_name"
    
    # Delete feature branch
    git branch -d $feature_branch
    
    print_status "Feature '$feature_name' has been merged into develop"
    print_status "You can now create a pull request to staging when ready"
}

# Function to deploy to staging
deploy_staging() {
    print_header "Deploying to staging"
    
    check_branch "develop"
    check_clean_working_dir
    
    # Run deployment validation
    print_status "Running deployment validation..."
    ./scripts/deploy-validation.sh staging
    
    # Update develop
    git pull origin develop
    
    # Update staging
    update_branch "staging"
    
    # Merge develop into staging
    git merge --no-ff develop -m "chore: deploy to staging"
    
    # Push to staging
    git push origin staging
    
    print_status "Successfully deployed to staging"
    print_status "AWS Amplify will automatically deploy the staging environment"
}

# Function to deploy to production
deploy_production() {
    print_header "Deploying to production"
    
    check_branch "staging"
    check_clean_working_dir
    
    # Run deployment validation
    print_status "Running deployment validation..."
    ./scripts/deploy-validation.sh production
    
    # Update staging
    git pull origin staging
    
    # Update main
    update_branch "main"
    
    # Merge staging into main
    git merge --no-ff staging -m "chore: deploy to production"
    
    # Push to main
    git push origin main
    
    print_status "Successfully deployed to production"
    print_status "AWS Amplify will automatically deploy the production environment"
}

# Function to create hotfix
create_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        print_error "Hotfix name is required. Usage: ./scripts/git-workflow.sh create-hotfix <hotfix-name>"
        exit 1
    fi
    
    print_header "Creating hotfix branch"
    
    # Ensure we're on main and it's up to date
    update_branch "main"
    
    # Create and checkout hotfix branch
    local hotfix_branch="hotfix/$hotfix_name"
    git checkout -b $hotfix_branch
    
    print_status "Created hotfix branch: $hotfix_branch"
    print_status "Make your urgent fixes and then use finish-hotfix"
}

# Function to finish hotfix
finish_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        print_error "Hotfix name is required. Usage: ./scripts/git-workflow.sh finish-hotfix <hotfix-name>"
        exit 1
    fi
    
    print_header "Finishing hotfix branch"
    
    local hotfix_branch="hotfix/$hotfix_name"
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" != "$hotfix_branch" ]; then
        print_error "You must be on the hotfix branch: $hotfix_branch"
        exit 1
    fi
    
    check_clean_working_dir
    
    # Update main
    update_branch "main"
    
    # Merge hotfix into main
    git merge --no-ff $hotfix_branch -m "fix: hotfix $hotfix_name"
    
    # Update staging
    update_branch "staging"
    
    # Merge hotfix into staging
    git merge --no-ff $hotfix_branch -m "fix: hotfix $hotfix_name"
    
    # Update develop
    update_branch "develop"
    
    # Merge hotfix into develop
    git merge --no-ff $hotfix_branch -m "fix: hotfix $hotfix_name"
    
    # Delete hotfix branch
    git branch -d $hotfix_branch
    
    # Push all branches
    git push origin main
    git push origin staging
    git push origin develop
    
    print_status "Hotfix '$hotfix_name' has been deployed to all environments"
}

# Function to show status
show_status() {
    print_header "Git Workflow Status"
    
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --oneline)"
    echo ""
    
    echo "Branch status:"
    git for-each-ref --format='%(refname:short) %(upstream:short) %(upstream:track)' refs/heads | while read branch upstream track; do
        if [ "$branch" = "main" ] || [ "$branch" = "staging" ] || [ "$branch" = "develop" ]; then
            if [ -n "$track" ]; then
                echo "  $branch -> $upstream $track"
            else
                echo "  $branch -> $upstream (up to date)"
            fi
        fi
    done
    
    echo ""
    echo "Recent commits:"
    git log --oneline -5 --graph --all
}

# Function to show help
show_help() {
    print_header "Git Workflow Commands"
    
    echo "Available commands:"
    echo ""
    echo "  create-feature <name>    - Create a new feature branch from develop"
    echo "  finish-feature <name>    - Merge feature branch into develop"
    echo "  deploy-staging          - Deploy develop to staging"
    echo "  deploy-production       - Deploy staging to production"
    echo "  create-hotfix <name>    - Create a hotfix branch from main"
    echo "  finish-hotfix <name>    - Deploy hotfix to all environments"
    echo "  status                  - Show current git status"
    echo "  help                    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/git-workflow.sh create-feature user-authentication"
    echo "  ./scripts/git-workflow.sh deploy-staging"
    echo "  ./scripts/git-workflow.sh create-hotfix critical-bug-fix"
}

# Main script logic
case "$1" in
    "create-feature")
        create_feature "$2"
        ;;
    "finish-feature")
        finish_feature "$2"
        ;;
    "deploy-staging")
        deploy_staging
        ;;
    "deploy-production")
        deploy_production
        ;;
    "create-hotfix")
        create_hotfix "$2"
        ;;
    "finish-hotfix")
        finish_hotfix "$2"
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 