#!/bin/bash

# Debug script for Amplify YAML parsing issues
set -e

echo "=== Amplify YAML Debug Script ==="
echo "Date: $(date)"
echo ""

# Check if yamllint is available
if command -v yamllint &> /dev/null; then
    echo "✓ yamllint found"
    echo "Running yamllint on amplify.yml..."
    yamllint amplify.yml || echo "yamllint found issues"
else
    echo "⚠ yamllint not found, installing..."
    pip install yamllint
    yamllint amplify.yml || echo "yamllint found issues"
fi

echo ""
echo "=== YAML Content Analysis ==="

# Check for colons in the file
echo "Checking for colons in amplify.yml..."
grep -n ":" amplify.yml || echo "No colons found"

echo ""
echo "Checking for potential YAML parsing issues..."

# Check for unquoted strings that might contain special characters
echo "Lines with potential unquoted strings:"
grep -n "http" amplify.yml || echo "No http URLs found"
grep -n "npm run" amplify.yml || echo "No npm run commands found"

echo ""
echo "=== File Encoding ==="
file amplify.yml

echo ""
echo "=== Character Analysis ==="
echo "Total lines: $(wc -l < amplify.yml)"
echo "Total characters: $(wc -c < amplify.yml)"

echo ""
echo "=== YAML Structure Validation ==="
# Try to parse with Python
python3 -c "
import yaml
import sys

try:
    with open('amplify.yml', 'r') as f:
        yaml.safe_load(f)
    print('✓ YAML parses successfully with Python')
except yaml.YAMLError as e:
    print(f'✗ YAML parsing error: {e}')
    sys.exit(1)
except Exception as e:
    print(f'✗ Unexpected error: {e}')
    sys.exit(1)
"

echo ""
echo "=== Amplify-specific validation ==="
echo "Checking for required Amplify fields..."

# Check for required fields
if grep -q "version:" amplify.yml; then
    echo "✓ version field found"
else
    echo "✗ version field missing"
fi

if grep -q "frontend:" amplify.yml; then
    echo "✓ frontend section found"
else
    echo "✗ frontend section missing"
fi

if grep -q "phases:" amplify.yml; then
    echo "✓ phases section found"
else
    echo "✗ phases section missing"
fi

if grep -q "build:" amplify.yml; then
    echo "✓ build phase found"
else
    echo "✗ build phase missing"
fi

echo ""
echo "=== Debug Complete ===" 