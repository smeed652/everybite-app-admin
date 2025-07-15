# Amplify Deployment Strategy

## Overview

This document outlines a comprehensive strategy to prevent AWS Amplify YAML parsing errors and ensure reliable deployments.

## Root Cause Analysis

### What Causes Amplify YAML Parsing Errors

1. **Colons in Comments**: `# Example: This comment has a colon`
2. **Unquoted URLs**: `npm run test --url http://localhost:6006`
3. **Script Names with Colons**: `npm run test:stories`
4. **Colons in Echo Statements**: `echo "Building for environment: $AWS_BRANCH"`

### Files That Impact Amplify Builds

#### Critical Files (Direct Impact)

- `amplify.yml` - Main buildspec file
- `package.json` - NPM scripts are parsed by Amplify

#### Secondary Files (Indirect Impact)

- `.github/workflows/ci.yml` - May reference problematic scripts
- `vercel.json` - Vercel deployment configuration
- `vercel.json` - Deployment configuration
- `cypress.env.json` - Test environment variables

## Prevention Strategy

### 1. Pre-Deployment Validation

#### Run Comprehensive Validation

```bash
# Before every deployment
./scripts/validate-amplify-comprehensive.sh
```

#### Run Quick Validation

```bash
# For quick checks
./scripts/validate-amplify-yaml.sh
```

### 2. File-Specific Rules

#### amplify.yml

✅ **DO:**

- Use dashes in comments: `# Example - This comment uses a dash`
- Quote all commands with URLs: `- "npm run test --url http://localhost:6006"`
- Use simple echo statements: `- echo "Building for environment $AWS_BRANCH"`

❌ **DON'T:**

- Use colons in comments: `# Example: This comment has a colon`
- Leave URLs unquoted: `- npm run test --url http://localhost:6006`
- Use colons in echo statements: `- echo "Building for environment: $AWS_BRANCH"`

#### package.json

✅ **DO:**

- Use dashes in script names: `"test-stories"`
- Quote URLs in complex commands: `"test-storybook --url \"http://127.0.0.1:7007\""`
- Use consistent naming conventions

❌ **DON'T:**

- Use colons in script names: `"test:stories"`
- Leave URLs unquoted: `"test-storybook --url http://127.0.0.1:7007"`

#### GitHub Actions (.github/workflows/ci.yml)

✅ **DO:**

- Reference scripts with dashes: `npm run test-stories`
- Quote URLs when needed: `CYPRESS_BASE_URL: "http://localhost:3000"`

❌ **DON'T:**

- Reference scripts with colons: `npm run test:stories`

### 3. Naming Conventions

#### Script Names

- ✅ Use dashes: `test-stories`, `test-unit`, `test-integration`
- ❌ Avoid colons: `test:stories`, `test:unit`, `test:integration`

#### Environment Variables

- ✅ Use underscores: `VITE_API_URL`, `CYPRESS_BASE_URL`
- ❌ Avoid colons in values: `VITE_API_URL=http://localhost:4000/graphql`

### 4. URL Handling

#### In npm Scripts

```json
// ✅ Good
"test-stories": "storybook build && npx start-server-and-test 'http-server -p 7007' 'http://127.0.0.1:7007' 'test-storybook --url \"http://127.0.0.1:7007\"'"

// ❌ Bad
"test-stories": "storybook build && npx start-server-and-test http-server -p 7007 http://127.0.0.1:7007 test-storybook --url http://127.0.0.1:7007"
```

#### In YAML Files

```yaml
# ✅ Good
- "npm run test --url http://localhost:6006"
- echo "Building for environment $AWS_BRANCH"

# ❌ Bad
- npm run test --url http://localhost:6006
- echo "Building for environment: $AWS_BRANCH"
```

## Deployment Workflow

### 1. Pre-Deployment Checklist

- [ ] Run comprehensive validation: `./scripts/validate-amplify-comprehensive.sh`
- [ ] Run quick validation: `./scripts/validate-amplify-yaml.sh`
- [ ] Test locally: `npm run build`
- [ ] Verify all npm scripts work: `npm run test-stories`
- [ ] Check for any new URLs or colons in recent changes

### 2. Deployment Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Follow naming conventions
   - Quote URLs appropriately
   - Avoid colons in comments

3. **Validate Changes**

   ```bash
   ./scripts/validate-amplify-comprehensive.sh
   ```

4. **Test Locally**

   ```bash
   npm run build
   npm run test-stories
   ```

5. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

6. **Create Pull Request**
   - Ensure CI passes
   - Review for any YAML issues

7. **Merge to Staging**
   - Monitor Amplify build
   - Verify deployment success

### 3. Emergency Fixes

If a deployment fails due to YAML parsing:

1. **Identify the Issue**

   ```bash
   ./scripts/validate-amplify-comprehensive.sh
   ```

2. **Fix the Problem**
   - Remove colons from comments
   - Quote unquoted URLs
   - Fix script name references

3. **Test the Fix**

   ```bash
   ./scripts/validate-amplify-yaml.sh
   npm run build
   ```

4. **Deploy the Fix**
   ```bash
   git add .
   git commit -m "fix(deployment): resolve YAML parsing error"
   git push origin staging
   ```

## Monitoring and Maintenance

### 1. Regular Validation

- Run comprehensive validation weekly
- Check for new files that might impact Amplify
- Review any new npm scripts or URLs

### 2. Team Training

- Share this strategy with all team members
- Include validation scripts in onboarding
- Document any new patterns or issues

### 3. Continuous Improvement

- Update validation scripts as needed
- Add new file types to comprehensive validation
- Refine rules based on new issues

## Troubleshooting

### Common Error Messages

```
CustomerError: The commands provided in the buildspec are malformed.
Please ensure that you have properly escaped reserved YAML characters.
If you have a ':' character in your command, encapsulate the command within quotes
```

**Likely Causes:**

- Colon in comment in `amplify.yml`
- Unquoted URL in npm script
- Script name with colon
- Colon in echo statement

### Debugging Steps

1. **Run Validation Scripts**

   ```bash
   ./scripts/validate-amplify-comprehensive.sh
   ```

2. **Check Recent Changes**

   ```bash
   git diff HEAD~5 --name-only
   ```

3. **Look for Colons**

   ```bash
   grep -r ":" . --include="*.yml" --include="*.json" | grep -v node_modules
   ```

4. **Check for URLs**
   ```bash
   grep -r "http://" . --include="*.yml" --include="*.json" | grep -v node_modules
   ```

## Tools and Scripts

### Validation Scripts

- `scripts/validate-amplify-yaml.sh` - Quick validation of amplify.yml
- `scripts/validate-amplify-comprehensive.sh` - Full validation of all files

### Usage

```bash
# Quick check
./scripts/validate-amplify-yaml.sh

# Comprehensive check
./scripts/validate-amplify-comprehensive.sh

# Check exit codes
echo $?  # 0 = success, 1 = critical issues, 2 = warnings
```

## Best Practices Summary

1. **Always quote URLs** in npm scripts and YAML files
2. **Use dashes, not colons** in script names and comments
3. **Run validation scripts** before every deployment
4. **Test locally** before pushing changes
5. **Keep script names consistent** across all files
6. **Document any new patterns** that cause issues
7. **Train team members** on these rules
8. **Monitor builds** and fix issues quickly

## Related Documents

- [Amplify YAML Rules](./AMPLIFY-YAML-RULES.md)
- [Development Guide](./DEVELOPMENT-GUIDE.MD)
- [Deployment Guide](./DEPLOYMENT.MD)
