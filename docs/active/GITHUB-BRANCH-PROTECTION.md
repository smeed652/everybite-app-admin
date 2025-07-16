# GitHub Branch Protection Setup

This document explains how to set up GitHub branch protection as an alternative to Amplify deployment gates to ensure only tested code gets deployed.

## Why Branch Protection?

Branch protection ensures that code cannot be pushed to the main branch unless it passes all CI checks. This prevents broken code from triggering Amplify deployments.

## Setup Instructions

### Step 1: Access Repository Settings

1. Go to your GitHub repository: `https://github.com/smeed652/everybite-app-admin`
2. Click on **Settings** tab
3. In the left sidebar, click **Branches**

### Step 2: Add Branch Protection Rule

1. Click **Add rule** or **Add branch protection rule**
2. In the **Branch name pattern** field, enter: `main`
3. Check the following options:

#### Required Status Checks

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Require conversation resolution before merging**

#### Status Checks to Require

- ✅ **CI** (this matches our workflow name)

#### Additional Settings

- ✅ **Require a pull request before merging**
- ✅ **Require approvals** (set to 1 if you want to review your own changes)
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Restrict pushes that create files larger than 100 MB**

### Step 3: Save the Rule

1. Click **Create** or **Save changes**
2. The rule will now be active for the `main` branch

## How It Works

### Before (Current)

```
Push to main → Amplify builds → Deploy (even if tests fail)
```

### After (With Branch Protection)

```
Push to feature branch → Create PR → CI runs → PR approved → Merge to main → Amplify builds → Deploy
```

## For Your Solo Development Workflow

Since you're working solo, you can modify the workflow:

### Option A: Direct Push with Protection

1. Push directly to `main`
2. GitHub will block the push if CI fails
3. Fix issues and push again
4. Only successful pushes trigger Amplify

### Option B: Feature Branch Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and push: `git push origin feature/new-feature`
3. Create PR on GitHub
4. CI runs automatically
5. Merge only after CI passes
6. Amplify deploys from `main`

## Benefits

1. **Prevents broken deployments** - Only tested code reaches main
2. **Works with any CI system** - Not dependent on Amplify features
3. **Better code history** - Clear separation of changes
4. **Future-proof** - Works when you add team members

## Configuration Commands

### Quick Setup Script

```bash
# Create a feature branch for testing
git checkout -b test-branch-protection

# Make a small change
echo "# Test" >> README.md

# Push and test the protection
git add README.md
git commit -m "test: verify branch protection"
git push origin test-branch-protection

# Create PR on GitHub and verify CI runs
# Then merge only after CI passes
```

### Disable Auto-Deploy in Amplify (Optional)

If you want even more control, you can disable auto-deploy in Amplify:

1. Go to Amplify Console
2. Navigate to **App settings** > **Build settings**
3. Look for **Auto-deploy** or **Build settings**
4. Disable automatic deployments
5. Deploy manually only when ready: `npm run deploy:simple`

## Verification

To verify branch protection is working:

1. **Make a change that breaks tests**
2. **Try to push to main**
3. **GitHub should block the push**
4. **Fix the issue and push again**
5. **Only successful pushes should trigger Amplify**

## Troubleshooting

### Push Blocked by Protection Rules

If you get an error like "Push rejected by branch protection rule":

1. **Check CI status** - Ensure the CI workflow passed
2. **Check branch status** - Make sure your local main is up to date
3. **Pull latest changes** - `git pull origin main`
4. **Re-run CI if needed** - Push again to trigger CI

### CI Not Running

1. **Check workflow file** - Ensure `.github/workflows/ci.yml` exists
2. **Check branch triggers** - Workflow must trigger on `main` branch
3. **Check GitHub Actions** - Ensure Actions are enabled for the repository

### Want to Bypass Protection (Emergency)

In emergency situations, you can temporarily disable protection:

1. Go to **Settings** > **Branches**
2. Click **Edit** on the main branch rule
3. Uncheck protection options temporarily
4. Make your emergency fix
5. Re-enable protection

## Related Files

- `.github/workflows/ci.yml` - GitHub CI configuration
- `amplify.yml` - Amplify build configuration
- `scripts/simple-workflow.sh` - Manual deployment script
