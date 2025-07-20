#!/bin/bash

# List Recent Tags Script for EveryBite App Admin
# Usage: ./scripts/workflow/list-recent-tags.sh [count]

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

# Parse arguments
COUNT=${1:-10}

# Validate count
if ! [[ "$COUNT" =~ ^[0-9]+$ ]]; then
    echo "Error: Count must be a number"
    echo "Usage: $0 [count]"
    echo "Example: $0 5"
    exit 1
fi

print_header "Recent Release Tags"

# Get recent release tags (full versions only)
RELEASE_TAGS=$(git tag --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -$COUNT)

if [ -z "$RELEASE_TAGS" ]; then
    echo "No release tags found."
else
    echo "$RELEASE_TAGS" | while IFS= read -r tag; do
        # Get tag date
        TAG_DATE=$(git log -1 --format=%cd --date=short "$tag")
        # Get tag message (first line only)
        TAG_MESSAGE=$(git tag -l --format='%(contents:subject)' "$tag" | head -1)
        echo -e "${GREEN}$tag${NC} ($TAG_DATE) - $TAG_MESSAGE"
    done
fi

echo ""
print_header "Recent Pre-release Tags"

# Get recent pre-release tags
PRERELEASE_TAGS=$(git tag --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+-' | head -5)

if [ -z "$PRERELEASE_TAGS" ]; then
    echo "No pre-release tags found."
else
    echo "$PRERELEASE_TAGS" | while IFS= read -r tag; do
        # Get tag date
        TAG_DATE=$(git log -1 --format=%cd --date=short "$tag")
        # Get tag message (first line only)
        TAG_MESSAGE=$(git tag -l --format='%(contents:subject)' "$tag" | head -1)
        echo -e "${YELLOW}$tag${NC} ($TAG_DATE) - $TAG_MESSAGE"
    done
fi

echo ""
print_header "Tag Statistics"

# Count total tags
TOTAL_TAGS=$(git tag | wc -l)
RELEASE_COUNT=$(git tag | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | wc -l)
PRERELEASE_COUNT=$(git tag | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+-' | wc -l)

echo "Total tags: $TOTAL_TAGS"
echo "Release tags: $RELEASE_COUNT"
echo "Pre-release tags: $PRERELEASE_COUNT"

# Show latest tag
LATEST_TAG=$(git tag --sort=-version:refname | head -1)
if [ -n "$LATEST_TAG" ]; then
    echo "Latest tag: $LATEST_TAG"
fi

echo ""
echo "To view detailed information about a tag:"
echo "  git show <tag-name>"
echo ""
echo "To create a new tag:"
echo "  ./scripts/workflow/create-release-tag.sh <version> <message>" 