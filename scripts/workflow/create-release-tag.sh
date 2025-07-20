#!/bin/bash

# Create Release Tag Script for EveryBite App Admin
# Usage: ./scripts/workflow/create-release-tag.sh <version> <message> [--hotfix]

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

# Parse arguments
VERSION=$1
MESSAGE=$2
IS_HOTFIX=${3:-false}
SPECIFIC_BUILD=${4:-}

# Validate required arguments
if [ -z "$VERSION" ] || [ -z "$MESSAGE" ]; then
    print_error "Usage: $0 <version> <message> [--hotfix] [--build <number>]"
    echo ""
    echo "Examples:"
    echo "  $0 v1.2.0 'Feature release: Enhanced SmartMenu functionality'"
    echo "  $0 v1.2.1 'Hotfix: Fix SmartMenu save issue' --hotfix"
    echo "  $0 v1.2.0-beta.1 'Beta release for testing'"
    echo "  $0 v1.2.0 'Feature release' --build 45"
    echo ""
    echo "Version format: vX.Y.Z or vX.Y.Z-prerelease"
    echo "Examples: v1.2.0, v1.2.1, v1.2.0-alpha.1, v1.2.0-beta.1, v1.2.0-rc.1"
    echo "Build numbers are automatically added unless specified with --build"
    exit 1
fi

print_header "Creating Release Tag: $VERSION"

# Get build number
if [ -n "$SPECIFIC_BUILD" ]; then
    BUILD_NUMBER=$SPECIFIC_BUILD
    print_status "Using specified build number: $BUILD_NUMBER"
else
    BUILD_NUMBER=$(git rev-list --count HEAD)
    print_status "Auto-generated build number: $BUILD_NUMBER"
fi

# Add build number to version if not present
if [[ ! $VERSION =~ \+ ]]; then
    VERSION_WITH_BUILD="${VERSION}+${BUILD_NUMBER}"
    print_status "Added build number to version: $VERSION_WITH_BUILD"
else
    VERSION_WITH_BUILD=$VERSION
    print_status "Version already includes build number: $VERSION_WITH_BUILD"
fi

# Validate version format
if [[ ! $VERSION_WITH_BUILD =~ ^v[0-9]+\.[0-9]+\.[0-9]+(\+[0-9]+)?(-[a-zA-Z0-9.-]+)?$ ]]; then
    print_error "Invalid version format: $VERSION_WITH_BUILD"
    echo "Use format: v1.2.0+45 or v1.2.0-beta.1+45"
    exit 1
fi

# Check if tag already exists
if git tag -l | grep -q "^$VERSION_WITH_BUILD$"; then
    print_error "Tag $VERSION_WITH_BUILD already exists!"
    echo ""
    echo "Existing tags:"
    git tag -l | grep "$VERSION_WITH_BUILD" | head -5
    echo ""
    echo "To delete and recreate:"
    echo "  git tag -d $VERSION_WITH_BUILD"
    echo "  git push origin --delete $VERSION_WITH_BUILD"
    exit 1
fi

# Determine target branch based on version type
if [[ $VERSION =~ -alpha\.|beta\.|rc\. ]]; then
    # Pre-release tags can be created from develop or staging
    TARGET_BRANCH="develop"
    print_status "Pre-release tag detected, using develop branch"
elif [ "$IS_HOTFIX" = "--hotfix" ]; then
    TARGET_BRANCH="production"
    print_status "Hotfix tag detected, using production branch"
else
    TARGET_BRANCH="production"
    print_status "Release tag detected, using production branch"
fi

# Ensure we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    print_error "Must be on $TARGET_BRANCH branch. Current branch: $CURRENT_BRANCH"
    echo ""
    echo "To switch branches:"
    echo "  git checkout $TARGET_BRANCH"
    echo "  git pull origin $TARGET_BRANCH"
    exit 1
fi

# Ensure working directory is clean
if ! git diff-index --quiet HEAD --; then
    print_error "Working directory is not clean. Please commit or stash changes."
    echo ""
    echo "To check status:"
    echo "  git status"
    echo ""
    echo "To stash changes:"
    echo "  git stash"
    echo ""
    echo "To commit changes:"
    echo "  git add ."
    echo "  git commit -m 'Prepare for release'"
    exit 1
fi

# Pull latest changes
print_status "Pulling latest changes from $TARGET_BRANCH..."
git pull origin $TARGET_BRANCH

# Get commit hash and timestamp
COMMIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Create enhanced tag message
TAG_MESSAGE="Release $VERSION_WITH_BUILD: $MESSAGE

## Summary
$MESSAGE

## Build Information
- Build Number: $BUILD_NUMBER
- Commit Count: $BUILD_NUMBER
- Branch: $TARGET_BRANCH
- Commit: $COMMIT_HASH
- Environment: production
- Deployment: AWS Amplify
- Timestamp: $TIMESTAMP

## Recent Changes
$(git log --oneline -5 --no-merges | sed 's/^/  - /')"

# Create annotated tag
print_status "Creating annotated tag: $VERSION_WITH_BUILD"
git tag -a "$VERSION_WITH_BUILD" -m "$TAG_MESSAGE"

# Push tag
print_status "Pushing tag to remote..."
git push origin "$VERSION_WITH_BUILD"

print_header "Success!"
print_status "Tag created and pushed: $VERSION_WITH_BUILD"
print_status "Tag message: $MESSAGE"
print_status "Build number: $BUILD_NUMBER"
print_status "Branch: $TARGET_BRANCH"
print_status "Commit: $COMMIT_HASH"

echo ""
echo "To view the tag:"
echo "  git show $VERSION_WITH_BUILD"
echo ""
echo "To list recent tags:"
echo "  ./scripts/workflow/list-recent-tags.sh"
echo ""
echo "To get build number:"
echo "  ./scripts/workflow/get-build-number.sh"
echo ""
echo "To create a GitHub release (if using GitHub):"
echo "  Visit: https://github.com/your-repo/releases/new"
echo "  Select tag: $VERSION_WITH_BUILD"
echo "  Add release notes based on the tag message" 