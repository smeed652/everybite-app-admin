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
    
    # Get recent changes summary
    local changes_summary=$(git log --oneline develop ^staging | head -5 | sed 's/^/  - /' | tr '\n' ' ')
    local commit_count=$(git rev-list --count develop ^staging)
    
    # Update staging
    update_branch "staging"
    
    # Create descriptive commit message
    local commit_message="deploy(staging): from develop - $commit_count commits

Recent changes:
$changes_summary

Environment: staging
Source: develop
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge develop into staging
    git merge --no-ff develop -m "$commit_message"
    
    # Push to staging
    git push origin staging
    
    print_status "Successfully deployed to staging"
    print_status "AWS Amplify will automatically deploy the staging environment"
    print_status "Deployment includes $commit_count commits from develop"
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
    
    # Get recent changes summary
    local changes_summary=$(git log --oneline staging ^production | head -5 | sed 's/^/  - /' | tr '\n' ' ')
    local commit_count=$(git rev-list --count staging ^production)
    
    # Update production
    update_branch "production"
    
    # Create descriptive commit message
    local commit_message="deploy(production): from staging - $commit_count commits

Recent changes:
$changes_summary

Environment: production
Source: staging
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge staging into production
    git merge --no-ff staging -m "$commit_message"
    
    # Push to production
    git push origin production
    
    print_status "Successfully deployed to production"
    print_status "AWS Amplify will automatically deploy the production environment"
    print_status "Deployment includes $commit_count commits from staging"
}

# Function to create hotfix
create_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        print_error "Hotfix name is required. Usage: ./scripts/git-workflow.sh create-hotfix <hotfix-name>"
        exit 1
    fi
    
    print_header "Creating hotfix branch"
    
    # Ensure we're on production and it's up to date
    update_branch "production"
    
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
    
    # Update production
    update_branch "production"
    
    # Create descriptive hotfix commit message
    local hotfix_message="hotfix(production): $hotfix_name

Environment: production
Type: urgent fix
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge hotfix into production
    git merge --no-ff $hotfix_branch -m "$hotfix_message"
    
    # Update staging
    update_branch "staging"
    
    # Create staging hotfix message
    local staging_hotfix_message="hotfix(staging): $hotfix_name

Environment: staging
Type: urgent fix
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge hotfix into staging
    git merge --no-ff $hotfix_branch -m "$staging_hotfix_message"
    
    # Update develop
    update_branch "develop"
    
    # Create develop hotfix message
    local develop_hotfix_message="hotfix(develop): $hotfix_name

Environment: develop
Type: urgent fix
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge hotfix into develop
    git merge --no-ff $hotfix_branch -m "$develop_hotfix_message"
    
    # Delete hotfix branch
    git branch -d $hotfix_branch
    
    # Push all branches
    git push origin production
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
        if [ "$branch" = "production" ] || [ "$branch" = "staging" ] || [ "$branch" = "develop" ]; then
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

# Function to deploy to staging with custom description
deploy_staging_custom() {
    local description=$1
    
    if [ -z "$description" ]; then
        print_error "Description is required. Usage: ./scripts/git-workflow.sh deploy-staging-custom \"<description>\""
        exit 1
    fi
    
    print_header "Deploying to staging with custom description"
    
    check_branch "develop"
    check_clean_working_dir
    
    # Run deployment validation
    print_status "Running deployment validation..."
    ./scripts/deploy-validation.sh staging
    
    # Update develop
    git pull origin develop
    
    # Get recent changes summary
    local changes_summary=$(git log --oneline develop ^staging | head -5 | sed 's/^/  - /' | tr '\n' ' ')
    local commit_count=$(git rev-list --count develop ^staging)
    
    # Update staging
    update_branch "staging"
    
    # Create descriptive commit message
    local commit_message="deploy(staging): $description

Recent changes:
$changes_summary

Environment: staging
Source: develop
Description: $description
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge develop into staging
    git merge --no-ff develop -m "$commit_message"
    
    # Push to staging
    git push origin staging
    
    print_status "Successfully deployed to staging"
    print_status "AWS Amplify will automatically deploy the staging environment"
    print_status "Deployment includes $commit_count commits from develop"
    print_status "Description: $description"
}

# Function to deploy to production with custom description
deploy_production_custom() {
    local description=$1
    
    if [ -z "$description" ]; then
        print_error "Description is required. Usage: ./scripts/git-workflow.sh deploy-production-custom \"<description>\""
        exit 1
    fi
    
    print_header "Deploying to production with custom description"
    
    check_branch "staging"
    check_clean_working_dir
    
    # Run deployment validation
    print_status "Running deployment validation..."
    ./scripts/deploy-validation.sh production
    
    # Update staging
    git pull origin staging
    
    # Get recent changes summary
    local changes_summary=$(git log --oneline staging ^production | head -5 | sed 's/^/  - /' | tr '\n' ' ')
    local commit_count=$(git rev-list --count staging ^production)
    
    # Update production
    update_branch "production"
    
    # Create descriptive commit message
    local commit_message="deploy(production): $description

Recent changes:
$changes_summary

Environment: production
Source: staging
Description: $description
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge staging into production
    git merge --no-ff staging -m "$commit_message"
    
    # Push to production
    git push origin production
    
    print_status "Successfully deployed to production"
    print_status "AWS Amplify will automatically deploy the production environment"
    print_status "Deployment includes $commit_count commits from staging"
    print_status "Description: $description"
}

# Function to deploy to staging from any branch (safely)
deploy_staging_from_develop() {
    print_header "Deploying to staging from develop (safe mode)"
    
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"
    
    check_clean_working_dir
    
    # Run deployment validation
    print_status "Running deployment validation..."
    ./scripts/deploy-validation.sh staging
    
    # Update develop from remote
    print_status "Updating develop from remote..."
    git fetch origin
    git checkout develop
    git pull origin develop
    
    # Get recent changes summary
    local changes_summary=$(git log --oneline develop ^staging | head -5 | sed 's/^/  - /' | tr '\n' ' ')
    local commit_count=$(git rev-list --count develop ^staging)
    
    if [ "$commit_count" -eq 0 ]; then
        print_warning "No new commits to deploy from develop to staging"
        print_status "Returning to original branch: $current_branch"
        git checkout $current_branch
        return 0
    fi
    
    # Update staging
    update_branch "staging"
    
    # Create descriptive commit message
    local commit_message="deploy(staging): from develop - $commit_count commits

Recent changes:
$changes_summary

Environment: staging
Source: develop
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    
    # Merge develop into staging
    git merge --no-ff develop -m "$commit_message"
    
    # Push to staging
    git push origin staging
    
    print_status "Successfully deployed to staging"
    print_status "AWS Amplify will automatically deploy the staging environment"
    print_status "Deployment includes $commit_count commits from develop"
    
    # Return to original branch
    print_status "Returning to original branch: $current_branch"
    git checkout $current_branch
}

# Function to deploy to production from any branch (safely)
deploy_production_from_staging() {
    print_header "Deploying to production from staging (safe mode)"
    
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"
    
    check_clean_working_dir
    
    # Run deployment validation
    print_status "Running deployment validation..."
    ./scripts/deploy-validation.sh production
    
    # Update staging from remote
    print_status "Updating staging from remote..."
    git fetch origin
    git checkout staging
    git pull origin staging
    
    # Get recent changes summary
    local changes_summary=$(git log --oneline staging ^production | head -5 | sed 's/^/  - /' | tr '\n' ' ')
    local commit_count=$(git rev-list --count staging ^production)
    
    if [ "$commit_count" -eq 0 ]; then
        print_warning "No new commits to deploy from staging to production"
        print_status "Returning to original branch: $current_branch"
        git checkout $current_branch
        return 0
    fi
    
    # Update production
    update_branch "production"
    
    # Create descriptive commit message
    local commit_message="deploy(production): from staging - $commit_count commits\n\nRecent changes:\n$changes_summary\n\nEnvironment: production\nSource: staging\nTimestamp: $(date -u +\"%Y-%m-%d %H:%M:%S UTC\")"
    
    # Merge staging into production
    git merge --no-ff staging -m "$commit_message"
    
    # Push to production
    git push origin production
    
    print_status "Successfully deployed to production"
    print_status "AWS Amplify will automatically deploy the production environment"
    print_status "Deployment includes $commit_count commits from staging"
    
    # Return to original branch
    print_status "Returning to original branch: $current_branch"
    git checkout $current_branch
}

# Function to show help
show_help() {
    print_header "Git Workflow Commands"
    
    echo "Available commands:"
    echo ""
    echo "  create-feature <name>           - Create a new feature branch from develop"
    echo "  finish-feature <name>           - Merge feature branch into develop"
    echo "  deploy-staging                  - Deploy develop to staging (must be on develop)"
    echo "  deploy-staging-from-develop     - Deploy develop to staging (works from any branch)"
    echo "  deploy-staging-custom <desc>    - Deploy to staging with custom description"
    echo "  deploy-production               - Deploy staging to production"
    echo "  deploy-production-from-staging  - Deploy staging to production (works from any branch)"
    echo "  deploy-production-custom <desc> - Deploy to production with custom description"
    echo "  create-hotfix <name>            - Create a hotfix branch from production"
    echo "  finish-hotfix <name>            - Deploy hotfix to all environments"
    echo "  status                          - Show current git status"
    echo "  help                            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/git-workflow.sh create-feature user-authentication"
    echo "  ./scripts/git-workflow.sh deploy-staging"
    echo "  ./scripts/git-workflow.sh deploy-staging-custom \"Fix Amplify YAML parsing issues\""
    echo "  ./scripts/git-workflow.sh deploy-production-custom \"Release SmartMenus feature\""
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
    "deploy-staging-from-develop")
        deploy_staging_from_develop
        ;;
    "deploy-staging-custom")
        deploy_staging_custom "$2"
        ;;
    "deploy-production")
        deploy_production
        ;;
    "deploy-production-custom")
        deploy_production_custom "$2"
        ;;
    "deploy-production-from-staging")
        deploy_production_from_staging
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