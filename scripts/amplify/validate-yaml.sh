#!/bin/bash

# YAML Validation Script for Amplify Deployment
# This script catches YAML parsing issues before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to validate YAML syntax
validate_yaml_syntax() {
    print_header "Validating YAML Syntax"
    
    # Check if yq is available
    if ! command -v yq &> /dev/null; then
        print_warning "yq not found. Installing yq for YAML validation..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install yq
        else
            print_error "Please install yq manually: https://github.com/mikefarah/yq#install"
            return 1
        fi
    fi
    
    # Validate amplify.yml
    if [ -f "amplify.yml" ]; then
        print_status "Validating amplify.yml..."
        if yq eval '.' amplify.yml > /dev/null 2>&1; then
            print_status "amplify.yml syntax is valid"
        else
            print_error "amplify.yml has invalid YAML syntax"
            yq eval '.' amplify.yml
            return 1
        fi
    fi
    
    # Validate package.json (check for unescaped colons in scripts)
    print_status "Checking package.json for unescaped colons..."
    
    # Extract all scripts from package.json and check for unescaped colons
    local scripts=$(node -e "
        const pkg = require('./package.json');
        Object.entries(pkg.scripts || {}).forEach(([name, script]) => {
            console.log(\`\${name}: \${script}\`);
        });
    ")
    
    local has_issues=false
    
    while IFS= read -r line; do
        if [[ -n "$line" ]]; then
            local script_name=$(echo "$line" | cut -d: -f1)
            local script_content=$(echo "$line" | cut -d: -f2-)
            
            # Check for unescaped colons in URLs
            if echo "$script_content" | grep -q 'http://[^"'"'"']*:[^"'"'"']*[^"'"'"']'; then
                print_error "Unescaped colon found in script '$script_name':"
                echo "  $script_content"
                has_issues=true
            fi
            
            # Check for unescaped colons in other contexts
            if echo "$script_content" | grep -q '[^"'"'"']:[0-9]'; then
                print_error "Potential unescaped colon found in script '$script_name':"
                echo "  $script_content"
                has_issues=true
            fi
        fi
    done <<< "$scripts"
    
    if [ "$has_issues" = true ]; then
        print_error "YAML validation failed - unescaped colons found in scripts"
        return 1
    else
        print_status "No unescaped colons found in package.json scripts"
    fi
}

# Function to simulate Amplify buildspec parsing
simulate_amplify_parsing() {
    print_header "Simulating Amplify Buildspec Parsing"
    
    # Create a temporary buildspec file to test parsing
    local temp_buildspec="temp_amplify.yml"
    
    # Extract the buildspec content
    cat > "$temp_buildspec" << 'EOF'
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm ci
    build:
      commands:
        - echo "Building application..."
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
EOF
    
    # Add the actual commands from amplify.yml
    if [ -f "amplify.yml" ]; then
        # Extract commands and add them to the temp buildspec
        local commands=$(yq eval '.frontend.phases.preBuild.commands[]' amplify.yml 2>/dev/null || echo "")
        if [ -n "$commands" ]; then
            # Replace the temp commands with real ones
            yq eval '.frontend.phases.preBuild.commands = []' "$temp_buildspec" > "${temp_buildspec}.tmp"
            mv "${temp_buildspec}.tmp" "$temp_buildspec"
            
            while IFS= read -r cmd; do
                if [ -n "$cmd" ]; then
                    yq eval ".frontend.phases.preBuild.commands += [\"$cmd\"]" "$temp_buildspec" > "${temp_buildspec}.tmp"
                    mv "${temp_buildspec}.tmp" "$temp_buildspec"
                fi
            done <<< "$commands"
        fi
    fi
    
    # Validate the temporary buildspec
    print_status "Validating buildspec YAML syntax..."
    if yq eval '.' "$temp_buildspec" > /dev/null 2>&1; then
        print_status "Buildspec YAML syntax is valid"
    else
        print_error "Buildspec YAML syntax is invalid"
        yq eval '.' "$temp_buildspec"
        rm -f "$temp_buildspec"
        return 1
    fi
    
    # Clean up
    rm -f "$temp_buildspec"
}

# Function to check for common YAML issues
check_common_issues() {
    print_header "Checking for Common YAML Issues"
    
    local issues_found=false
    
    # Check for unquoted strings with special characters
    if grep -r 'http://[^"'"'"']*:[^"'"'"']*[^"'"'"']' . --include="*.yml" --include="*.yaml" --include="*.json" 2>/dev/null; then
        print_error "Found unquoted URLs with colons in YAML/JSON files"
        issues_found=true
    fi
    
    # Check for unescaped colons in package.json scripts
    if grep -q '"[^"]*http://[^"]*:[^"]*[^"]*"' package.json 2>/dev/null; then
        print_error "Found potentially unescaped colons in package.json scripts"
        issues_found=true
    fi
    
    # Check for malformed YAML in amplify.yml
    if [ -f "amplify.yml" ]; then
        if grep -q ':[^ ]*http://' amplify.yml; then
            print_error "Found unquoted URLs in amplify.yml"
            issues_found=true
        fi
    fi
    
    if [ "$issues_found" = false ]; then
        print_status "No common YAML issues found"
    else
        return 1
    fi
}

# Main validation function
main() {
    print_header "YAML Validation for Amplify Deployment"
    
    local exit_code=0
    
    # Run all validations
    validate_yaml_syntax || exit_code=1
    simulate_amplify_parsing || exit_code=1
    check_common_issues || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        print_status "All YAML validations passed! ✅"
        echo ""
        print_status "Your code is ready for Amplify deployment"
    else
        print_error "YAML validation failed! ❌"
        echo ""
        print_error "Please fix the issues above before deploying"
        exit 1
    fi
}

# Run the script
main "$@" 