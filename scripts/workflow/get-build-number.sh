#!/bin/bash

# Get Build Number Script for EveryBite App Admin
# Usage: ./scripts/workflow/get-build-number.sh

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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_header "Build Number Information"

# Get total commit count as build number
BUILD_NUMBER=$(git rev-list --count HEAD)
NEXT_BUILD=$((BUILD_NUMBER + 1))

print_status "Current build number: $BUILD_NUMBER"
print_status "Next build number: $NEXT_BUILD"

# Get current version from package.json if it exists
if [ -f "package.json" ]; then
    CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    print_status "Current version (package.json): $CURRENT_VERSION"
    
    echo ""
    print_header "Suggested Tags"
    echo "  v$CURRENT_VERSION+$NEXT_BUILD"
    echo "  v$CURRENT_VERSION-beta.1+$NEXT_BUILD"
    echo "  v$CURRENT_VERSION-rc.1+$NEXT_BUILD"
fi

# Show recent tags with build numbers
echo ""
print_header "Recent Tags with Build Numbers"
RECENT_TAGS=$(git tag --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+\+[0-9]+' | head -5)

if [ -z "$RECENT_TAGS" ]; then
    echo "No tags with build numbers found."
else
    echo "$RECENT_TAGS" | while IFS= read -r tag; do
        # Extract build number from tag
        BUILD_FROM_TAG=$(echo "$tag" | sed 's/.*+//')
        # Get tag date
        TAG_DATE=$(git log -1 --format=%cd --date=short "$tag" 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}$tag${NC} ($TAG_DATE) - Build $BUILD_FROM_TAG"
    done
fi

# Show build statistics
echo ""
print_header "Build Statistics"

# Count total commits
TOTAL_COMMITS=$(git rev-list --count HEAD)
echo "Total commits in repository: $TOTAL_COMMITS"

# Count commits since last tag
LAST_TAG=$(git tag --sort=-version:refname | head -1)
if [ -n "$LAST_TAG" ]; then
    COMMITS_SINCE_LAST_TAG=$(git rev-list --count HEAD ^$LAST_TAG)
    echo "Commits since last tag ($LAST_TAG): $COMMITS_SINCE_LAST_TAG"
else
    echo "No tags found in repository"
fi

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

echo ""
echo "To create a new tag with this build number:"
echo "  ./scripts/workflow/create-release-tag.sh v1.2.0 'Your release message'"
echo ""
echo "To create a tag with a specific build number:"
echo "  ./scripts/workflow/create-release-tag.sh v1.2.0 'Your release message' --build $NEXT_BUILD" 