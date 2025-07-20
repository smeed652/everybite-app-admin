#!/bin/bash

# Get Next Version Script for EveryBite App Admin
# Usage: ./scripts/workflow/get-next-version.sh [patch|minor|major]

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Parse arguments
VERSION_TYPE=${1:-patch}

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_warning "Invalid version type: $VERSION_TYPE"
    echo "Usage: $0 [patch|minor|major]"
    echo "Default: patch"
    VERSION_TYPE="patch"
fi

print_header "Next Version Suggestions"

# Get current version from package.json
if [ ! -f "package.json" ]; then
    print_warning "package.json not found. Using default version 1.0.0"
    CURRENT_VERSION="1.0.0"
else
    CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
fi

print_status "Current version: $CURRENT_VERSION"

# Get build number
BUILD_NUMBER=$(git rev-list --count HEAD)
NEXT_BUILD=$((BUILD_NUMBER + 1))

print_status "Current build: $BUILD_NUMBER"
print_status "Next build: $NEXT_BUILD"

# Calculate next version based on type
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case $VERSION_TYPE in
    "major")
        NEXT_MAJOR=$((MAJOR + 1))
        NEXT_VERSION="$NEXT_MAJOR.0.0"
        print_status "Version type: major (breaking changes)"
        ;;
    "minor")
        NEXT_MINOR=$((MINOR + 1))
        NEXT_VERSION="$MAJOR.$NEXT_MINOR.0"
        print_status "Version type: minor (new features)"
        ;;
    "patch")
        NEXT_PATCH=$((PATCH + 1))
        NEXT_VERSION="$MAJOR.$MINOR.$NEXT_PATCH"
        print_status "Version type: patch (bug fixes)"
        ;;
esac

echo ""
print_header "Suggested Tags"

# Standard release tags
echo -e "${GREEN}Release Tags:${NC}"
echo "  v$NEXT_VERSION+$NEXT_BUILD"
echo "  v$NEXT_VERSION+$NEXT_BUILD (recommended)"

# Pre-release tags
echo ""
echo -e "${YELLOW}Pre-release Tags:${NC}"
echo "  v$NEXT_VERSION-alpha.1+$NEXT_BUILD"
echo "  v$NEXT_VERSION-beta.1+$NEXT_BUILD"
echo "  v$NEXT_VERSION-rc.1+$NEXT_BUILD"

# Show version progression
echo ""
print_header "Version Progression"
echo "Current:  $CURRENT_VERSION"
echo "Next:     $NEXT_VERSION"
echo "Build:    $NEXT_BUILD"
echo "Full:     v$NEXT_VERSION+$NEXT_BUILD"

# Show recent version history
echo ""
print_header "Recent Version History"
RECENT_TAGS=$(git tag --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+' | head -5)

if [ -z "$RECENT_TAGS" ]; then
    echo "No version tags found."
else
    echo "$RECENT_TAGS" | while IFS= read -r tag; do
        # Get tag date
        TAG_DATE=$(git log -1 --format=%cd --date=short "$tag" 2>/dev/null || echo "unknown")
        # Extract version without build number
        VERSION_ONLY=$(echo "$tag" | sed 's/+.*//')
        echo -e "  ${GREEN}$VERSION_ONLY${NC} ($TAG_DATE)"
    done
fi

# Show semantic versioning explanation
echo ""
print_header "Semantic Versioning Guide"
echo "MAJOR.MINOR.PATCH+build"
echo ""
echo "  MAJOR: Breaking changes, major features, or architectural changes"
echo "  MINOR: New features added in a backward-compatible manner"
echo "  PATCH: Backward-compatible bug fixes and minor improvements"
echo "  BUILD: Sequential build number for tracking deployments"
echo ""
echo "Examples:"
echo "  v1.2.0+45  - New features (minor)"
echo "  v1.2.1+46  - Bug fixes (patch)"
echo "  v2.0.0+47  - Breaking changes (major)"

echo ""
echo "To create a tag with the suggested version:"
echo "  ./scripts/workflow/create-release-tag.sh v$NEXT_VERSION 'Your release message'"
echo ""
echo "To update package.json version:"
echo "  npm version $VERSION_TYPE --no-git-tag-version"
echo ""
echo "To see build number information:"
echo "  ./scripts/workflow/get-build-number.sh" 