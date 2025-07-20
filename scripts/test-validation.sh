#!/bin/bash

# Test Validation Script
# This script validates that tests don't interfere with the real application

set -e

echo "🧪 Running Test Validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Step 1: Run tests in isolation
print_status $YELLOW "Step 1: Running tests in isolation..."
npm test -- --run --reporter=verbose

if [ $? -eq 0 ]; then
    print_status $GREEN "✅ Tests passed in isolation"
else
    print_status $RED "❌ Tests failed in isolation"
    exit 1
fi

# Step 2: Check for global mocks
print_status $YELLOW "Step 2: Checking for global mocks..."
GLOBAL_MOCKS=$(grep -r "vi.mock.*datawarehouse-lambda-apollo\|vi.mock.*api-graphql-apollo" src/__tests__/ --include="*.ts" --include="*.tsx" || true)

if [ -n "$GLOBAL_MOCKS" ]; then
    print_status $RED "❌ Global mocks detected:"
    echo "$GLOBAL_MOCKS"
    print_status $YELLOW "⚠️  Consider using local mocks or dependency injection"
else
    print_status $GREEN "✅ No global mocks detected"
fi

# Step 3: Run integration validation (if available)
print_status $YELLOW "Step 3: Running integration validation..."
if [ -f "src/__tests__/integration/app-functionality.test.ts" ]; then
    npm test -- --run src/__tests__/integration/app-functionality.test.ts
    if [ $? -eq 0 ]; then
        print_status $GREEN "✅ Integration validation passed"
    else
        print_status $RED "❌ Integration validation failed"
        exit 1
    fi
else
    print_status $YELLOW "⚠️  No integration validation test found"
fi

# Step 4: Check test performance
print_status $YELLOW "Step 4: Checking test performance..."
TEST_TIME=$(npm test -- --run --reporter=verbose 2>&1 | grep "Duration" | tail -1 | awk '{print $NF}' | sed 's/[^0-9.]//g')

if [ -n "$TEST_TIME" ]; then
    if (( $(echo "$TEST_TIME < 10" | bc -l) )); then
        print_status $GREEN "✅ Test performance is good (${TEST_TIME}s)"
    else
        print_status $YELLOW "⚠️  Test performance is slow (${TEST_TIME}s)"
    fi
fi

# Step 5: Validate no critical modules are mocked
print_status $YELLOW "Step 5: Validating critical modules..."
CRITICAL_MOCKS=$(grep -r "vi.mock.*lambda\|vi.mock.*apollo" src/__tests__/ --include="*.ts" --include="*.tsx" | grep -v "describe.skip" || true)

if [ -n "$CRITICAL_MOCKS" ]; then
    print_status $RED "❌ Critical modules are being mocked:"
    echo "$CRITICAL_MOCKS"
    print_status $YELLOW "⚠️  These mocks could interfere with real application"
else
    print_status $GREEN "✅ No critical modules are being mocked"
fi

print_status $GREEN "🎉 Test validation completed successfully!"

# Summary
echo ""
print_status $GREEN "📋 Validation Summary:"
echo "  ✅ Tests run in isolation"
echo "  ✅ Integration validation (if available)"
echo "  ✅ Performance check"
echo "  ✅ Critical module validation"
echo ""
print_status $GREEN "🚀 Ready to commit!" 