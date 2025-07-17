#!/bin/bash

# Configuration - Update these values
LAMBDA_URL="https://your-lambda-function-url"
API_KEY="your-api-key"

echo "🔍 Exploring Athena schema with cURL..."

# Schema exploration query
curl -X POST \
  "${LAMBDA_URL}/graphql" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "query": "query ExploreSchema { schemaExploration { tables { tableName } widgetInteractionsColumns { columnName dataType comment } dbWidgetsColumns { columnName dataType comment } widgetInteractionsSample { values } dbWidgetsSample { values } } }"
  }' | jq '.'

echo -e "\n✅ Schema exploration completed!"
echo -e "\n💡 TIPS:"
echo "• Use these column names when creating new queries"
echo "• Check data types to ensure proper filtering"
echo "• Sample data shows the actual data format" 