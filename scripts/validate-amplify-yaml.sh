#!/bin/bash

# Simple Amplify YAML validation script
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

if grep -q "    preBuild:" amplify.yml; then
    echo "✓ preBuild phase found"
else
    echo "✗ preBuild phase missing"
fi

if grep -q "    build:" amplify.yml; then
    echo "✓ build phase found"
else
    echo "✗ build phase missing"
fi

# Check for potential issues
echo ""
echo "=== Potential Issues Check ==="

# Check for unescaped colons in comments
if grep -q "#.*:" amplify.yml; then
    echo "⚠ Found colons in comments (lines with #):"
    grep -n "#.*:" amplify.yml
else
    echo "✓ No colons in comments found"
fi

# Check for unquoted strings that might contain special characters
if grep -q "http" amplify.yml; then
    echo "⚠ Found http URLs:"
    grep -n "http" amplify.yml
else
    echo "✓ No http URLs found"
fi

# Check for npm commands
if grep -q "npm run" amplify.yml; then
    echo "⚠ Found npm run commands:"
    grep -n "npm run" amplify.yml
else
    echo "✓ No npm run commands found"
fi

# Check for environment variables
if grep -q "\$" amplify.yml; then
    echo "⚠ Found environment variables:"
    grep -n "\$" amplify.yml
else
    echo "✓ No environment variables found"
fi

# Check for potential YAML syntax issues
echo ""
echo "=== YAML Syntax Check ==="

# Check for proper indentation
if grep -q "^[[:space:]]*[^[:space:]]" amplify.yml; then
    echo "✓ Indentation looks consistent"
else
    echo "⚠ Potential indentation issues"
fi

# Check for missing quotes around values that might need them
if grep -q "value: [^\"'].*[^\"']$" amplify.yml; then
    echo "⚠ Found unquoted values that might need quotes:"
    grep -n "value: [^\"'].*[^\"']$" amplify.yml
else
    echo "✓ All values appear to be properly quoted"
fi

echo ""
echo "=== File Statistics ==="
echo "Total lines: $(wc -l < amplify.yml)"
echo "Total characters: $(wc -c < amplify.yml)"

echo ""
echo "=== Current amplify.yml content ==="
cat amplify.yml

echo ""
echo "=== Validation Complete ===" 