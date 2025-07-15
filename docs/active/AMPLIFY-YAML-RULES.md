# Amplify YAML Parsing Rules

## Overview

AWS Amplify uses YAML parsing for buildspec files and npm scripts. Understanding these rules is crucial to prevent deployment failures.

## Key Rules

### 1. Colon Character Escaping

**Rule**: Any command containing a `:` character must be properly quoted in YAML context.

**Problem**: Unescaped colons in URLs or commands cause YAML parsing errors:

```
CustomerError: The commands provided in the buildspec are malformed. Please ensure that you have properly escaped reserved YAML characters. If you have a ':' character in your command, encapsulate the command within quotes
```

**Solution**: Always quote URLs and commands containing colons:

```json
// ❌ WRONG - Unescaped colons
"test-stories": "storybook build --quiet && npx start-server-and-test 'http-server storybook-static -p 7007' http://127.0.0.1:7007 'test-storybook --url http://127.0.0.1:7007'"

// ✅ CORRECT - Properly quoted
"test-stories": "storybook build --quiet && npx start-server-and-test 'http-server storybook-static -p 7007' 'http://127.0.0.1:7007' 'test-storybook --url \"http://127.0.0.1:7007\"'"
```

### 2. URL Quoting Strategy

When dealing with URLs in npm scripts:

1. **Single quotes for the entire command segment**: `'http://127.0.0.1:7007'`
2. **Double quotes for URLs within command arguments**: `--url "http://127.0.0.1:7007"`
3. **Escape inner quotes**: Use `\"` for double quotes inside single-quoted strings

### 3. Common Patterns to Watch For

#### URLs in Commands

```json
// Always quote URLs with colons
"dev": "vite --port 3000",  // ✅ No colons, no problem
"test-stories": "storybook --url 'http://localhost:6006'",  // ✅ Quoted URL
```

#### Port Numbers

```json
// Port numbers in commands need quoting
"storybook": "storybook dev -p 6006",  // ✅ No colons in port flag
"server": "http-server -p 8080",  // ✅ No colons in port flag
```

#### Environment Variables

```json
// Environment variables with colons need special handling
"dev": "vite --port $PORT",  // ✅ Environment variable, no direct colons
```

## Validation Checklist

Before pushing to staging/production, verify:

- [ ] All URLs in npm scripts are properly quoted
- [ ] No unescaped colons in command strings
- [ ] Port numbers in commands don't contain colons
- [ ] Environment variables are properly handled

## Testing Locally

To validate YAML syntax locally:

```bash
# Test the package.json scripts
npm run test-stories

# Validate amplify.yml syntax
yamllint amplify.yml  # If you have yamllint installed
```

## Common Mistakes

1. **Forgetting to quote URLs in complex commands**
2. **Mixing quote styles incorrectly**
3. **Not escaping inner quotes**
4. **Assuming port flags don't need quoting**

## Example Fixes

### Before (Broken)

```json
{
  "scripts": {
    "test-stories": "storybook build && npx start-server-and-test 'http-server -p 7007' http://127.0.0.1:7007 'test-storybook --url http://127.0.0.1:7007'"
  }
}
```

### After (Fixed)

```json
{
  "scripts": {
    "test-stories": "storybook build && npx start-server-and-test 'http-server -p 7007' 'http://127.0.0.1:7007' 'test-storybook --url \"http://127.0.0.1:7007\"'"
  }
}
```

## Related Files

- `amplify.yml` - Main buildspec file
- `package.json` - Contains npm scripts that Amplify parses
- `scripts/deploy-validation.sh` - Pre-deployment validation

## Resources

- [AWS Amplify Buildspec Reference](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
- [YAML Syntax Guide](https://yaml.org/spec/1.2/spec.html)
- [npm Scripts Documentation](https://docs.npmjs.com/cli/v8/using-npm/scripts)
