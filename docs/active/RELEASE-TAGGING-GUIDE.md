# Release Tagging Guide

This document outlines the release tagging strategy for the EveryBite App Admin project, designed to work seamlessly with our existing Git workflow and deployment processes.

## Overview

Our release tagging approach follows semantic versioning (SemVer) with build numbers and integrates with our existing branch strategy (`develop` → `staging` → `production`) and AWS Amplify deployment pipeline.

## Version Numbering Strategy

### Semantic Versioning with Build Numbers

We follow the standard `MAJOR.MINOR.PATCH+build` format:

- **MAJOR** (X.0.0): Breaking changes, major feature releases, or significant architectural changes
- **MINOR** (0.X.0): New features added in a backward-compatible manner
- **PATCH** (0.0.X): Backward-compatible bug fixes and minor improvements
- **BUILD** (+N): Sequential build number for tracking deployments

**Examples**:

- `v1.2.0+45` - Feature release, build 45
- `v1.2.1+46` - Hotfix release, build 46
- `v2.0.0+47` - Major release, build 47

### Pre-release Tags with Build Numbers

For development and testing phases:

- **Alpha**: `v1.2.0-alpha.1+43` - Early development, unstable
- **Beta**: `v1.2.0-beta.1+44` - Feature complete, testing phase
- **Release Candidate**: `v1.2.0-rc.1+45` - Final testing before release

## Build Number Management

### Build Number Sources

We use multiple sources to generate build numbers:

1. **Git Commit Count**: `git rev-list --count HEAD` (total commits in repository)
2. **Branch-Specific Count**: `git rev-list --count develop` (commits since branch creation)
3. **Date-Based**: `YYYYMMDDHH` (year, month, day, hour)
4. **AWS Amplify Build ID**: Use Amplify's built-in build number

### Recommended Build Number Strategy

For this project, we recommend using **Git commit count** as it provides:

- Sequential numbering
- Unique across all branches
- Easy to correlate with Git history
- Works well with our existing workflow

### Build Number Script

```bash
#!/bin/bash
# scripts/workflow/get-build-number.sh

# Get total commit count as build number
BUILD_NUMBER=$(git rev-list --count HEAD)
echo $BUILD_NUMBER
```

## Release Types and Tagging Strategy

### 1. Feature Releases (Minor Versions)

**When**: New features, significant improvements, or milestone achievements
**Branch**: `main` → `staging` → `production`
**Tag Format**: `v1.2.0+45`

**Process**:

1. Develop features on `main` branch
2. When ready for release, create tag on main: `npm run release:tag v1.2.0 "Feature release"`
3. Deploy to staging: `npm run deploy:staging:safe`
4. Test and validate in staging environment
5. Deploy to production: `npm run deploy:production:safe`

### 2. Hotfix Releases (Patch Versions)

**When**: Critical bug fixes that need immediate production deployment
**Branch**: `main` → hotfix branch → `staging` → `production`
**Tag Format**: `v1.2.1+46`

**Process**:

1. Create hotfix branch from `main`
2. Fix the issue and test
3. Create tag on main: `npm run release:tag v1.2.1 "Hotfix: description" --hotfix`
4. Deploy to staging for validation
5. Deploy to production

### 3. Major Releases (Major Versions)

**When**: Breaking changes, major refactoring, or significant architectural changes
**Branch**: `main` → `staging` → `production`
**Tag Format**: `v2.0.0+47`

**Process**:

1. Plan and document breaking changes
2. Develop on `main` branch
3. Create tag on main: `npm run release:tag v2.0.0 "Major release: description"`
4. Extensive testing in staging
5. Deploy to production

## Tagging Workflow

### Automated Tagging Script with Build Numbers

We provide a script to automate the tagging process with build numbers:

```bash
# Create a new release tag (build number auto-generated)
./scripts/workflow/create-release-tag.sh v1.2.0 "Feature release: Enhanced SmartMenu functionality"

# Create a hotfix tag (build number auto-generated)
./scripts/workflow/create-release-tag.sh v1.2.1 "Hotfix: Fix SmartMenu save issue" --hotfix

# Create a pre-release tag (build number auto-generated)
./scripts/workflow/create-release-tag.sh v1.2.0-beta.1 "Beta release for testing"

# Create tag with specific build number
./scripts/workflow/create-release-tag.sh v1.2.0+45 "Feature release: Enhanced SmartMenu functionality" --build 45
```

### Manual Tagging Process with Build Numbers

If you prefer manual tagging:

```bash
# 1. Get current build number
BUILD_NUMBER=$(git rev-list --count HEAD)

# 2. Ensure you're on the correct branch (main for releases)
git checkout main
git pull origin main

# 3. Create an annotated tag with build number
git tag -a "v1.2.0+$BUILD_NUMBER" -m "Release v1.2.0+$BUILD_NUMBER: Enhanced SmartMenu functionality

- Added new SmartMenu features panel
- Improved caching mechanism
- Fixed save functionality issues
- Updated navigation icons

Build: $BUILD_NUMBER
Environment: main
Deployment: AWS Amplify (when ready)
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

# 4. Push the tag
git push origin "v1.2.0+$BUILD_NUMBER"
```

## Integration with Existing Workflow

### Current Workflow Integration

Our tagging strategy integrates with existing scripts:

1. **Deployment Scripts**: Tags are created after successful deployment
2. **Validation Scripts**: Ensure code quality before tagging
3. **Branch Protection**: Maintains our `main` → `staging` → `production` flow
4. **Build Tracking**: Build numbers correlate with deployment history

### Enhanced Workflow Commands

Add these to your `package.json` scripts:

```json
{
  "scripts": {
    "release:tag": "./scripts/workflow/create-release-tag.sh",
    "release:hotfix": "./scripts/workflow/create-release-tag.sh --hotfix",
    "release:preview": "./scripts/workflow/create-release-tag.sh --preview",
    "release:list": "./scripts/workflow/list-recent-tags.sh",
    "build:number": "./scripts/workflow/get-build-number.sh",
    "version:next": "./scripts/workflow/get-next-version.sh"
  }
}
```

## Tag Naming Conventions

### Standard Release Tags with Build Numbers

- `v1.2.0+45` - Feature release, build 45
- `v1.2.1+46` - Patch/hotfix release, build 46
- `v2.0.0+47` - Major release, build 47

### Pre-release Tags with Build Numbers

- `v1.2.0-alpha.1+43` - Alpha release, build 43
- `v1.2.0-beta.1+44` - Beta release, build 44
- `v1.2.0-rc.1+45` - Release candidate, build 45

### Special Tags

- `v1.2.0+45-staging` - Staging environment snapshot, build 45
- `v1.2.0+45-{feature-name}` - Feature-specific tags with build numbers

## Tag Message Format with Build Numbers

### Standard Format

```
Release v1.2.0+45: Enhanced SmartMenu functionality

## What's New
- Added new SmartMenu features panel
- Improved caching mechanism
- Fixed save functionality issues

## Technical Changes
- Updated GraphQL fragments for better performance
- Enhanced error handling in SmartMenu components
- Improved TypeScript type definitions

## Build Information
- Build Number: 45
- Commit Count: 45
- Branch: main
- Commit: abc1234

## Breaking Changes
- None

## Migration Notes
- No migration required

Environment: main
Deployment: AWS Amplify (when ready)
Timestamp: 2024-01-15 14:30:00 UTC
```

### Hotfix Format

```
Hotfix v1.2.1+46: Fix SmartMenu save issue

## Issue Fixed
- SmartMenu save button disabled after first save
- Root cause: Apollo client mismatch in useUpdateWidget hook

## Changes Made
- Fixed Apollo client consistency in useUpdateWidget
- Updated useWidget hook to include refetch capability
- Enhanced error handling in save process

## Build Information
- Build Number: 46
- Commit Count: 46
- Branch: main
- Commit: def5678

## Testing
- Verified save functionality works for multiple saves
- Tested in staging environment
- Confirmed no regression in existing features

Environment: main
Deployment: AWS Amplify (when ready)
Timestamp: 2024-01-15 16:45:00 UTC
```

## Build Number Tracking

### Build Number History

Track build numbers to correlate with:

- Deployment history
- Git commit history
- AWS Amplify build logs
- Release notes

### Build Number Database

Consider maintaining a simple build number log:

```bash
# scripts/workflow/log-build.sh
#!/bin/bash

BUILD_NUMBER=$1
VERSION=$2
BRANCH=$3
COMMIT=$4

echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC"),$BUILD_NUMBER,$VERSION,$BRANCH,$COMMIT" >> .build-log.csv
```

### Build Number Analysis

```bash
# scripts/workflow/analyze-builds.sh
#!/bin/bash

echo "Build Number Analysis"
echo "===================="
echo ""

# Show recent builds
echo "Recent builds:"
tail -10 .build-log.csv | while IFS=',' read -r date build version branch commit; do
    echo "  Build $build: $version ($branch) - $date"
done

# Show build frequency
echo ""
echo "Build frequency by month:"
cut -d',' -f1 .build-log.csv | cut -d' ' -f1 | cut -d'-' -f1,2 | sort | uniq -c | sort -nr
```

## Best Practices

### 1. Build Number Management

- **Always increment**: Build numbers should never decrease
- **Track consistently**: Use the same source for build numbers across all releases
- **Document changes**: Log build numbers with release information
- **Correlate with deployments**: Link build numbers to AWS Amplify deployments

### 2. Tag Timing

- **Always tag after successful production deployment**
- **Never tag before deployment** - ensures tag represents deployed code
- **Tag from the correct branch** (usually `production`)
- **Include build number** - correlates with deployment history

### 3. Tag Messages

- **Be descriptive** - explain what changed and why
- **Include build information** - build number, commit count, branch
- **Include breaking changes** - clearly document any breaking changes
- **Reference issues** - link to relevant GitHub issues or JIRA tickets
- **Include technical details** - mention significant technical changes

### 4. Version Management

- **Increment appropriately** - follow SemVer rules strictly
- **Plan major versions** - coordinate breaking changes
- **Use pre-releases** - for testing and validation
- **Track build numbers** - maintain build number history

### 5. Tag Maintenance

- **Regular cleanup** - remove old pre-release tags periodically
- **Documentation** - keep release notes updated
- **Validation** - ensure tags point to deployed code
- **Build tracking** - maintain build number correlation

## Automation Scripts

### Create Release Tag Script (Enhanced)

```bash
#!/bin/bash
# scripts/workflow/create-release-tag.sh

set -e

VERSION=$1
MESSAGE=$2
IS_HOTFIX=${3:-false}
SPECIFIC_BUILD=${4:-}

if [ -z "$VERSION" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: $0 <version> <message> [--hotfix] [--build <number>]"
    echo "Example: $0 v1.2.0 'Feature release: Enhanced SmartMenu'"
    echo "Example: $0 v1.2.0 'Feature release' --build 45"
    exit 1
fi

# Get build number
if [ -n "$SPECIFIC_BUILD" ]; then
    BUILD_NUMBER=$SPECIFIC_BUILD
else
    BUILD_NUMBER=$(git rev-list --count HEAD)
fi

# Add build number to version if not present
if [[ ! $VERSION =~ \+ ]]; then
    VERSION_WITH_BUILD="${VERSION}+${BUILD_NUMBER}"
else
    VERSION_WITH_BUILD=$VERSION
fi

# Validate version format
if [[ ! $VERSION_WITH_BUILD =~ ^v[0-9]+\.[0-9]+\.[0-9]+(\+[0-9]+)?(-[a-zA-Z0-9.-]+)?$ ]]; then
    echo "Error: Invalid version format. Use format: v1.2.0+45 or v1.2.0-beta.1+45"
    exit 1
fi

# Rest of the script remains the same...
```

### Get Build Number Script

```bash
#!/bin/bash
# scripts/workflow/get-build-number.sh

# Get total commit count as build number
BUILD_NUMBER=$(git rev-list --count HEAD)
echo "Current build number: $BUILD_NUMBER"
echo "Next build number: $((BUILD_NUMBER + 1))"
```

### Get Next Version Script

```bash
#!/bin/bash
# scripts/workflow/get-next-version.sh

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Get build number
BUILD_NUMBER=$(git rev-list --count HEAD)
NEXT_BUILD=$((BUILD_NUMBER + 1))

echo "Current version: $CURRENT_VERSION"
echo "Current build: $BUILD_NUMBER"
echo "Next build: $NEXT_BUILD"
echo ""
echo "Suggested tags:"
echo "  v$CURRENT_VERSION+$NEXT_BUILD"
echo "  v$CURRENT_VERSION-beta.1+$NEXT_BUILD"
echo "  v$CURRENT_VERSION-rc.1+$NEXT_BUILD"
```

## Integration with CI/CD

### AWS Amplify Integration

Our tagging strategy works with AWS Amplify's deployment pipeline:

1. **Automatic Deployments**: Tags trigger deployments to staging/production
2. **Environment Variables**: Tags and build numbers can be used as environment variables
3. **Rollback Capability**: Tags enable quick rollbacks to previous versions
4. **Build Tracking**: Build numbers correlate with Amplify build IDs

### Environment Variables

Set these in AWS Amplify:

```bash
# Amplify environment variables
RELEASE_VERSION=v1.2.0+45
BUILD_NUMBER=45
DEPLOYMENT_ENV=production
```

### GitHub Actions Integration (Future)

Consider adding GitHub Actions for automated tagging:

```yaml
# .github/workflows/release.yml
name: Create Release

on:
  push:
    tags:
      - "v*+*"

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Extract version and build
        id: extract
        run: |
          VERSION=${GITHUB_REF#refs/tags/}
          BUILD_NUMBER=$(echo $VERSION | sed 's/.*+//')
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "build_number=$BUILD_NUMBER" >> $GITHUB_OUTPUT
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.extract.outputs.version }}
          release_name: Release ${{ steps.extract.outputs.version }}
          body: |
            Build Number: ${{ steps.extract.outputs.build_number }}
            ${{ github.event.head_commit.message }}
          draft: false
          prerelease: false
```

## Troubleshooting

### Common Issues

1. **Build Number Conflicts**

   ```bash
   # Check existing build numbers
   git tag | grep "+45"

   # Use next available build number
   NEXT_BUILD=$(($(git rev-list --count HEAD) + 1))
   echo "Next build number: $NEXT_BUILD"
   ```

2. **Tag Already Exists**

   ```bash
   # Check existing tags
   git tag -l | grep v1.2.0+45

   # Delete local tag if needed
   git tag -d v1.2.0+45

   # Delete remote tag if needed
   git push origin --delete v1.2.0+45
   ```

3. **Wrong Branch**

   ```bash
   # Check current branch
   git branch --show-current

   # Switch to correct branch
   git checkout production
   ```

4. **Dirty Working Directory**

   ```bash
   # Check status
   git status

   # Stash changes if needed
   git stash

   # Or commit changes
   git add .
   git commit -m "Prepare for release"
   ```

## Summary

This enhanced release tagging approach with build numbers provides:

- **Consistency**: Standardized versioning and tagging process
- **Integration**: Works seamlessly with existing workflow
- **Automation**: Scripts to reduce manual errors
- **Documentation**: Clear guidelines for all team members
- **Flexibility**: Supports different release types and scenarios
- **Tracking**: Build numbers correlate deployments with releases
- **History**: Maintains build number history for analysis

The strategy maintains our existing `develop` → `staging` → `production` workflow while adding proper version tracking, build number management, and release management capabilities.
