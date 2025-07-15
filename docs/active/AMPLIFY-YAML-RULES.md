# Amplify YAML Rules and Best Practices

## Overview

AWS Amplify uses a YAML parser that is sensitive to certain characters, particularly colons (`:`) in specific contexts. This document outlines the rules and best practices for writing `amplify.yml` files that work reliably with Amplify.

## Colon Usage Rules

### ✅ ACCEPTABLE Colons (These are fine)

- **YAML key-value pairs**: `version: 1`, `frontend:`, `phases:`
- **Environment variables**: `$AWS_BRANCH:`, `$NODE_ENV:`
- **Quoted strings containing colons**: `"npm run test-stories"`

### ❌ PROBLEMATIC Colons (These cause parsing errors)

- **Colons in comments**: `# Example: This comment has a colon`
- **Unquoted URLs**: `npm run test --url http://localhost:6006`
- **NPM script names with colons**: `npm run test:stories` (use `test-stories` instead)

## Common Issues and Solutions

### Issue 1: Colons in Comments

**Problem:**

```yaml
# Example: This comment has a colon
- npm run build
```

**Solution:**

```yaml
# Example - This comment uses a dash instead
- npm run build
```

### Issue 2: Unquoted URLs in Commands

**Problem:**

```yaml
- npm run test --url http://localhost:6006
```

**Solution:**

```yaml
- "npm run test --url http://localhost:6006"
```

### Issue 3: NPM Script Names with Colons

**Problem:**

```yaml
- npm run test:stories
```

**Solution:**

```yaml
- npm run test-stories
```

## Validation Script

Use the included validation script to check your `amplify.yml` before deployment:

```bash
./scripts/validate-amplify-yaml.sh
```

This script will:

- Check for problematic colons in comments
- Identify unquoted URLs
- Flag npm scripts with colons
- Validate basic YAML structure

## Best Practices

1. **Always quote commands containing URLs**
2. **Use dashes instead of colons in comments**
3. **Avoid colons in npm script names**
4. **Run the validation script before pushing**
5. **Test locally before deploying to Amplify**

## Examples

### ✅ Good amplify.yml

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Building for environment: $AWS_BRANCH"
        - npm install
    build:
      commands:
        - npm run build
        - "npm run test-stories"
```

### ❌ Bad amplify.yml

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        # Example: This comment has a colon
        - echo "Building for environment: $AWS_BRANCH"
        - npm install
    build:
      commands:
        - npm run build
        - npm run test:stories
        - npm run test --url http://localhost:6006
```

## Troubleshooting

If you encounter YAML parsing errors:

1. Run the validation script: `./scripts/validate-amplify-yaml.sh`
2. Check for colons in comments
3. Ensure URLs are properly quoted
4. Verify npm script names don't contain colons
5. Test with a minimal `amplify.yml` to isolate the issue

## Related Files

- `scripts/validate-amplify-yaml.sh` - Validation script
- `scripts/debug-amplify-yaml.sh` - Debug script for complex issues
