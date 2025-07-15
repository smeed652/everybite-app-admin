#!/bin/bash

# Pre-commit validation script for Amplify YAML issues
# This script can be used as a git pre-commit hook

set -e

echo "🔍 Running Amplify YAML validation..."

# Run quick validation first
if ! ./scripts/validate-amplify-yaml.sh; then
    echo "❌ Quick validation failed. Please fix the issues above."
    echo "💡 Run './scripts/validate-amplify-comprehensive.sh' for detailed analysis."
    exit 1
fi

# Check if any YAML or JSON files were modified
modified_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(yml|yaml|json)$' | grep -v node_modules || true)

if [ -n "$modified_files" ]; then
    echo "📝 Modified configuration files detected:"
    echo "$modified_files"
    echo ""
    echo "🔍 Running comprehensive validation..."
    
    if ! ./scripts/validate-amplify-comprehensive.sh; then
        echo "❌ Comprehensive validation failed. Please fix the issues above."
        echo "💡 Critical issues must be fixed before committing."
        exit 1
    fi
fi

echo "✅ Amplify YAML validation passed!"
echo "🚀 Ready to commit." 