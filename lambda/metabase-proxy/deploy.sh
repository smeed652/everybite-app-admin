#!/bin/bash

# Simple Lambda Deployment Script
# This script uses the proper deployment validation workflow

set -e

echo "🚀 EveryBite SmartMenu Analytics Lambda Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
    echo "❌ Error: Please run this script from the lambda/metabase-proxy directory"
    exit 1
fi

# Run deployment with validation
./scripts/deployment/deploy-with-validation.sh dev

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test the deployment: ./scripts/run-tests.sh"
echo "2. Deploy to staging: ./scripts/deployment/deploy-with-validation.sh staging"
echo "3. Monitor CloudWatch logs for any issues" 