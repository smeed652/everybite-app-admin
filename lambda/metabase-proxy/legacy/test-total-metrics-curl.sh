#!/bin/bash

# Configuration - Update these values
LAMBDA_URL="https://your-lambda-function-url"
API_KEY="your-api-key"

echo "🧪 Testing totalMetrics query with cURL..."

# Test 1: Full year 2024
echo "📅 Test 1: Full year 2024"
curl -X POST \
  "${LAMBDA_URL}/graphql" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "query": "query TestTotalMetrics($startDate: String!, $endDate: String!) { totalMetrics(startDate: $startDate, endDate: $endDate) { totalOrders totalDinerVisits startDate endDate } }",
    "variables": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }' | jq '.'

echo -e "\n" && echo "=".repeat(50) && echo -e "\n"

# Test 2: Q1 2024
echo "📅 Test 2: Q1 2024"
curl -X POST \
  "${LAMBDA_URL}/graphql" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "query": "query TestTotalMetrics($startDate: String!, $endDate: String!) { totalMetrics(startDate: $startDate, endDate: $endDate) { totalOrders totalDinerVisits startDate endDate } }",
    "variables": {
      "startDate": "2024-01-01",
      "endDate": "2024-03-31"
    }
  }' | jq '.'

echo -e "\n" && echo "=".repeat(50) && echo -e "\n"

# Test 3: Last 30 days
echo "📅 Test 3: Last 30 days"
START_DATE=$(date -d '30 days ago' +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

curl -X POST \
  "${LAMBDA_URL}/graphql" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "{
    \"query\": \"query TestTotalMetrics(\$startDate: String!, \$endDate: String!) { totalMetrics(startDate: \$startDate, endDate: \$endDate) { totalOrders totalDinerVisits startDate endDate } }\",
    \"variables\": {
      \"startDate\": \"${START_DATE}\",
      \"endDate\": \"${END_DATE}\"
    }
  }" | jq '.'

echo -e "\n✅ All tests completed!" 