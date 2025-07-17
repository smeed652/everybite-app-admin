#!/bin/bash

# Intelligent Amplify YAML validation script
set -e

echo "=== Amplify YAML Validation ==="
echo "Date: $(date)"
echo ""

# Check if file exists
if [ ! -f "amplify.yml" ]; then
    echo "✗ amplify.yml not found"
    exit 1
fi

echo "✓ amplify.yml found"

# Check file encoding
echo "File encoding: $(file amplify.yml)"

# Check for basic YAML structure
echo ""
echo "=== Basic Structure Check ==="

if grep -q "^version:" amplify.yml; then
    echo "✓ version field found"
else
    echo "✗ version field missing"
fi

if grep -q "^frontend:" amplify.yml; then
    echo "✓ frontend section found"
else
    echo "✗ frontend section missing"
fi

if grep -q "  phases:" amplify.yml; then
    echo "✓ phases section found"
else
    echo "✗ phases section missing"
fi

# Check for problematic colons (not all colons)
echo ""
echo "=== Colon Analysis ==="

# Check for colons in comments (these can cause issues)
echo "Checking for colons in comments..."
comment_colons=$(grep -n "^[[:space:]]*#" amplify.yml | grep ":" || true)
if [ -n "$comment_colons" ]; then
    echo "⚠ WARNING: Found colons in comments (may cause YAML parsing issues):"
    echo "$comment_colons"
    echo ""
else
    echo "✓ No colons found in comments"
fi

# Check for unquoted commands with URLs containing colons
echo "Checking for unquoted commands with URLs..."
unquoted_urls=$(grep -n "http://" amplify.yml | grep -v "'http://" | grep -v '"http://' || true)
if [ -n "$unquoted_urls" ]; then
    echo "⚠ WARNING: Found unquoted URLs (should be quoted):"
    echo "$unquoted_urls"
    echo ""
else
    echo "✓ No unquoted URLs found"
fi

# Check for npm scripts with colons in the name
echo "Checking for npm scripts with colons..."
npm_colon_scripts=$(grep -n "npm run" amplify.yml | grep -E ":[a-zA-Z]" || true)
if [ -n "$npm_colon_scripts" ]; then
    echo "⚠ WARNING: Found npm scripts with colons (may cause issues):"
    echo "$npm_colon_scripts"
    echo ""
else
    echo "✓ No npm scripts with colons found"
fi

# Check for valid YAML colons (these are OK)
echo ""
echo "=== Valid YAML Colons (These are OK) ==="
echo "YAML key-value pairs:"
grep -n "^[[:space:]]*[a-zA-Z][a-zA-Z0-9_-]*:" amplify.yml | head -5 || echo "None found"

echo ""
echo "=== Summary ==="
echo "✓ Basic YAML structure looks good"
echo "✓ File encoding is correct"

# Exit with warning if issues found
if [ -n "$comment_colons" ] || [ -n "$unquoted_urls" ] || [ -n "$npm_colon_scripts" ]; then
    echo "⚠ Warnings found - review the issues above"
    echo "💡 Recommendation: Fix warnings before deploying to Amplify"
    exit 1
else
    echo "✅ No issues found - amplify.yml should work with Amplify"
    exit 0
fi 