# Amplify Deployment Gates Configuration

This document explains how to configure AWS Amplify to wait for GitHub CI to pass before deploying your application.

## Why Deployment Gates?

Deployment gates ensure that only code that passes all tests gets deployed to production. This prevents broken code from reaching your users and maintains high code quality.

## Current Setup

### What We've Done

1. **Removed E2E tests from Amplify** - These are now handled by GitHub CI
2. **Optimized Amplify build** - Faster deployments with just build steps
3. **Created configuration script** - `npm run amplify:configure-gates`

### What You Need to Do

Configure Amplify to wait for GitHub CI status before deploying.

## Finding Deployment Gates

### Option 1: App Settings (Most Common)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
2. Select your app (`everybite-app-admin`)
3. Go to **App settings** (bottom of left sidebar)
4. Look for **Deployment gates** or **Build settings** within App settings

### Option 2: Build Settings (Alternative Location)

1. Go to **Hosting** > **Build settings**
2. Scroll down to find **Deployment gates** section
3. If not visible, try the App settings location above

### Option 3: If Deployment Gates Not Visible

If you don't see "Deployment gates" as an option, this could be because:

1. **Feature not available in your region** - Try switching to `us-west-1` region
2. **Amplify version doesn't support it** - Update to latest Amplify CLI
3. **Permissions issue** - Ensure you have admin access to the app
4. **Feature flag not enabled** - Contact AWS support

## Manual Configuration (When Available)

### Step 1: Enable Deployment Gates

1. Navigate to the deployment gates section (see locations above)
2. Check **Enable deployment gates**

### Step 2: Add GitHub Status Check Gate

1. Click **Add deployment gate**
2. Select **GitHub status check**
3. Configure with these settings:
   - **Repository**: `smeed652/everybite-app-admin`
   - **Branch**: `main`
   - **Status check**: `CI`
4. Click **Save**

## Alternative: Manual Build Control

If deployment gates aren't available, you can implement manual control:

### Option A: Use Amplify CLI with Manual Approval

```bash
# Deploy only after CI passes
npm run deploy:simple
```

### Option B: Configure Branch Protection in GitHub

1. Go to your GitHub repository settings
2. Navigate to **Branches** > **Branch protection rules**
3. Add rule for `main` branch
4. Enable **Require status checks to pass before merging**
5. Select the `CI` status check

### Option C: Use GitHub Actions for Deployment

Instead of Amplify auto-deploying, use GitHub Actions to deploy only after CI passes:

1. Create a new workflow file: `.github/workflows/deploy.yml`
2. Configure it to deploy to Amplify only after CI succeeds
3. Disable auto-deploy in Amplify

## Automated Configuration

You can also use the provided script:

```bash
npm run amplify:configure-gates
```

This script will:

- Guide you through the configuration
- Attempt to configure via AWS CLI
- Provide fallback instructions if CLI fails

## How It Works

### Before (Current)

```
Push to main → Amplify builds → Amplify runs tests → Deploy
```

### After (With Gates)

```
Push to main → GitHub CI runs → Amplify waits for CI → Deploy
```

## Benefits

1. **Faster Amplify builds** - No E2E tests in Amplify
2. **Better test coverage** - CI runs comprehensive tests
3. **Deployment safety** - Only tested code deploys
4. **Parallel execution** - CI and Amplify can run simultaneously

## Troubleshooting

### Gate Not Triggering

1. **Check repository name** - Must match exactly: `smeed652/everybite-app-admin`
2. **Check branch name** - Must be `main`
3. **Check status check name** - Must be `CI` (matches our workflow name)

### Permissions Issues

1. **GitHub App permissions** - Amplify needs access to read status checks
2. **Repository access** - Ensure Amplify can access your repository

### CI Not Running

1. **Check workflow file** - Ensure `.github/workflows/ci.yml` exists
2. **Check branch triggers** - Workflow must trigger on `main` branch
3. **Check GitHub Actions** - Ensure Actions are enabled for the repository

### Deployment Gates Not Available

1. **Check region** - Try `us-west-1` (most features available)
2. **Check Amplify version** - Update to latest version
3. **Check permissions** - Ensure admin access to the app
4. **Contact AWS support** - Feature might need to be enabled

## Verification

To verify the setup is working:

1. **Push a change to main**
2. **Check GitHub Actions** - CI should start running
3. **Check Amplify Console** - Build should be waiting for CI
4. **Wait for CI to complete** - Amplify should then deploy

## Rollback

If you need to disable deployment gates:

1. Go to the deployment gates section
2. Uncheck **Enable deployment gates**
3. Save changes

## Related Files

- `.github/workflows/ci.yml` - GitHub CI configuration
- `amplify.yml` - Amplify build configuration
- `scripts/configure-amplify-gates.sh` - Configuration script
