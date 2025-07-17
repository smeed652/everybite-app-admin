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
echo "✅ All tests completed successfully!"
echo ""
echo "📝 Next steps:"
echo "  - Deploy changes: npm run deploy"
echo "  - Test in staging environment"
echo "  - Monitor CloudWatch logs for any issues" 