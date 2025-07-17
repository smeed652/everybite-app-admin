#!/bin/bash

# EveryBite SmartMenu Analytics GraphQL API - Test Runner
# This script runs all tests for the Lambda function

set -e

echo "🧪 Running EveryBite SmartMenu Analytics GraphQL API Tests"
echo "=========================================================="

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
    echo "❌ Error: Please run this script from the lambda/metabase-proxy directory"
    exit 1
fi

# Check if deployment validation is needed
if [ "$1" = "--deploy-first" ] || [ "$1" = "-d" ]; then
    echo ""
    echo "🚀 Running deployment with validation first..."
    ./scripts/deployment/deploy-with-validation.sh dev
    echo ""
fi

# Check environment
echo "📋 Checking environment configuration..."
./scripts/deployment/check-env.sh

echo ""
echo "🔑 Testing API key authentication..."
node scripts/testing/test-api-key.js

echo ""
echo "📊 Testing table resolvers..."
node scripts/testing/test-table-resolvers.js

echo ""
echo "🔍 Testing enhanced queries..."
node scripts/testing/test-enhanced-queries.js

echo ""
echo "📈 Testing quarterly metrics dashboard..."
node scripts/testing/test-quarterly-metrics-refactored.js

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "Usage:"
echo "  ./scripts/run-tests.sh          - Run tests only"
echo "  ./scripts/run-tests.sh --deploy-first  - Deploy and validate first, then run tests" 