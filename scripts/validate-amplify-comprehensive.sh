#!/bin/bash

# Comprehensive Amplify YAML validation script
# Checks all files that could impact Amplify's build process
set -e

echo "=== Comprehensive Amplify Validation ==="
echo "Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "FAIL")
            echo -e "${RED}✗${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠${NC} $message"
            ;;
    esac
}

# Initialize counters
total_issues=0
critical_issues=0

echo "=== 1. Core Amplify Configuration ==="

# Check amplify.yml
if [ -f "amplify.yml" ]; then
    print_status "PASS" "amplify.yml found"
    
    # Check for colons in comments
    comment_colons=$(grep -n "^[[:space:]]*#" amplify.yml | grep ":" || true)
    if [ -n "$comment_colons" ]; then
        print_status "FAIL" "Found colons in comments in amplify.yml"
        echo "$comment_colons"
        ((critical_issues++))
    else
        print_status "PASS" "No colons in comments"
    fi
    
    # Check for unquoted URLs
    unquoted_urls=$(grep -n "http://" amplify.yml | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "FAIL" "Found unquoted URLs in amplify.yml"
        echo "$unquoted_urls"
        ((critical_issues++))
    else
        print_status "PASS" "No unquoted URLs"
    fi
    
    # Check for npm scripts with colons
    npm_colon_scripts=$(grep -n "npm run" amplify.yml | grep -E ":[a-zA-Z]" || true)
    if [ -n "$npm_colon_scripts" ]; then
        print_status "FAIL" "Found npm scripts with colons in amplify.yml"
        echo "$npm_colon_scripts"
        ((critical_issues++))
    else
        print_status "PASS" "No npm scripts with colons"
    fi
else
    print_status "FAIL" "amplify.yml not found"
    ((critical_issues++))
fi

echo ""
echo "=== 2. Package.json Analysis ==="

# Check package.json
if [ -f "package.json" ]; then
    print_status "PASS" "package.json found"
    
    # Check for unquoted URLs in npm scripts
    unquoted_urls=$(grep -n "http://" package.json | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "FAIL" "Found unquoted URLs in package.json scripts"
        echo "$unquoted_urls"
        ((critical_issues++))
    else
        print_status "PASS" "No unquoted URLs in package.json"
    fi
    
    # Check for script names with colons
    colon_scripts=$(grep -n '"test:.*"' package.json || true)
    if [ -n "$colon_scripts" ]; then
        print_status "WARN" "Found script names with colons (consider using dashes)"
        echo "$colon_scripts"
        ((total_issues++))
    else
        print_status "PASS" "No script names with colons"
    fi
    
    # Check for complex commands that might need quoting
    complex_commands=$(grep -n '"test-.*"' package.json | grep -E "http://|https://" || true)
    if [ -n "$complex_commands" ]; then
        print_status "WARN" "Found complex commands with URLs - verify proper quoting"
        echo "$complex_commands"
        ((total_issues++))
    else
        print_status "PASS" "No complex commands with URLs"
    fi
else
    print_status "FAIL" "package.json not found"
    ((critical_issues++))
fi

echo ""
echo "=== 3. GitHub Actions Workflow ==="

# Check GitHub Actions workflow
if [ -f ".github/workflows/ci.yml" ]; then
    print_status "PASS" "GitHub Actions workflow found"
    
    # Check for npm run commands that reference scripts with colons
    colon_script_refs=$(grep -n "npm run" .github/workflows/ci.yml | grep -E "test:.*" || true)
    if [ -n "$colon_script_refs" ]; then
        print_status "FAIL" "Found references to scripts with colons in GitHub Actions"
        echo "$colon_script_refs"
        ((critical_issues++))
    else
        print_status "PASS" "No references to scripts with colons"
    fi
    
    # Check for unquoted URLs
    unquoted_urls=$(grep -n "http://" .github/workflows/ci.yml | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "WARN" "Found unquoted URLs in GitHub Actions (may not affect Amplify)"
        echo "$unquoted_urls"
        ((total_issues++))
    else
        print_status "PASS" "No unquoted URLs in GitHub Actions"
    fi
else
    print_status "WARN" "GitHub Actions workflow not found (optional)"
fi

echo ""
echo "=== 4. Docker Configuration ==="

# Check docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    print_status "PASS" "docker-compose.yml found"
    
    # Check for unquoted URLs
    unquoted_urls=$(grep -n "http://" docker-compose.yml | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "WARN" "Found unquoted URLs in docker-compose.yml (may not affect Amplify)"
        echo "$unquoted_urls"
        ((total_issues++))
    else
        print_status "PASS" "No unquoted URLs in docker-compose.yml"
    fi
    
    # Check for npm run commands
    npm_commands=$(grep -n "npm run" docker-compose.yml || true)
    if [ -n "$npm_commands" ]; then
        print_status "WARN" "Found npm run commands in docker-compose.yml (verify script names)"
        echo "$npm_commands"
        ((total_issues++))
    else
        print_status "PASS" "No npm run commands in docker-compose.yml"
    fi
else
    print_status "WARN" "docker-compose.yml not found (optional)"
fi

echo ""
echo "=== 5. Other Configuration Files ==="

# Check vercel.json
if [ -f "vercel.json" ]; then
    print_status "PASS" "vercel.json found"
    
    # Check for unquoted URLs
    unquoted_urls=$(grep -n "http://" vercel.json | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "WARN" "Found unquoted URLs in vercel.json (may not affect Amplify)"
        echo "$unquoted_urls"
        ((total_issues++))
    else
        print_status "PASS" "No unquoted URLs in vercel.json"
    fi
else
    print_status "WARN" "vercel.json not found (optional)"
fi

# Check cypress.env.json
if [ -f "cypress.env.json" ]; then
    print_status "PASS" "cypress.env.json found"
    
    # Check for unquoted URLs
    unquoted_urls=$(grep -n "http://" cypress.env.json | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "WARN" "Found unquoted URLs in cypress.env.json (may not affect Amplify)"
        echo "$unquoted_urls"
        ((total_issues++))
    else
        print_status "PASS" "No unquoted URLs in cypress.env.json"
    fi
else
    print_status "WARN" "cypress.env.json not found (optional)"
fi

echo ""
echo "=== 6. Backend Configuration ==="

# Check backend/package.json
if [ -f "backend/package.json" ]; then
    print_status "PASS" "backend/package.json found"
    
    # Check for unquoted URLs
    unquoted_urls=$(grep -n "http://" backend/package.json | grep -v "'http://" | grep -v '"http://' || true)
    if [ -n "$unquoted_urls" ]; then
        print_status "WARN" "Found unquoted URLs in backend/package.json (may not affect Amplify)"
        echo "$unquoted_urls"
        ((total_issues++))
    else
        print_status "PASS" "No unquoted URLs in backend/package.json"
    fi
else
    print_status "WARN" "backend/package.json not found (optional)"
fi

echo ""
echo "=== 7. Validation Summary ==="

if [ $critical_issues -eq 0 ]; then
    print_status "PASS" "No critical issues found"
else
    print_status "FAIL" "Found $critical_issues critical issue(s)"
fi

if [ $total_issues -eq 0 ]; then
    print_status "PASS" "No warnings found"
else
    print_status "WARN" "Found $total_issues warning(s)"
fi

echo ""
echo "=== 8. Recommendations ==="

if [ $critical_issues -gt 0 ]; then
    echo "🔴 CRITICAL: Fix these issues before deploying to Amplify:"
    echo "   - Remove colons from comments in amplify.yml"
    echo "   - Quote all URLs in npm scripts"
    echo "   - Avoid colons in npm script names"
    echo "   - Ensure all npm run commands reference valid scripts"
    echo ""
fi

if [ $total_issues -gt 0 ]; then
    echo "🟡 WARNINGS: Consider addressing these for consistency:"
    echo "   - Quote URLs in all configuration files"
    echo "   - Use dashes instead of colons in script names"
    echo "   - Verify all npm run commands are correct"
    echo ""
fi

echo "✅ BEST PRACTICES:"
echo "   - Run this script before every deployment"
echo "   - Use the validation script: ./scripts/validate-amplify-yaml.sh"
echo "   - Test locally before pushing to staging"
echo "   - Keep script names consistent (use dashes, not colons)"

echo ""
echo "=== Validation Complete ==="

# Exit with appropriate code
if [ $critical_issues -gt 0 ]; then
    exit 1
elif [ $total_issues -gt 0 ]; then
    exit 2
else
    exit 0
fi 