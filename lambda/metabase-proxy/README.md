# Metabase Proxy Lambda Function

This Lambda function serves as a GraphQL interface to query Athena data via Metabase for analytics, including quarterly metrics, daily orders, and total metrics.

## Features

- **GraphQL API**: Query analytics data using GraphQL
- **Authentication**: Supports both JWT tokens and API keys
- **Date Range Queries**: Filter data by specific date ranges
- **Real-time Analytics**: Get up-to-date metrics from Athena

## Available Queries

### 1. totalMetrics

Get total orders and diner visits between two dates.

**Parameters:**

- `startDate` (String!, required): Start date in YYYY-MM-DD format
- `endDate` (String!, required): End date in YYYY-MM-DD format

**Returns:**

```graphql
type TotalMetrics {
  totalOrders: Int!
  totalDinerVisits: Int!
  startDate: String!
  endDate: String!
}
```

**Example Query:**

```graphql
query GetTotalMetrics($startDate: String!, $endDate: String!) {
  totalMetrics(startDate: $startDate, endDate: $endDate) {
    totalOrders
    totalDinerVisits
    startDate
    endDate
  }
}
```

**Example Variables:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### 2. dailyOrders

Get daily order counts within a date range.

**Parameters:**

- `startDate` (String, optional): Start date in YYYY-MM-DD format
- `endDate` (String, optional): End date in YYYY-MM-DD format

**Returns:**

```graphql
type DailyOrders {
  date: String!
  count: Int!
}
```

### 3. quarterlyMetrics

Get quarterly metrics including orders, brands, and locations.

**Parameters:**

- `startQuarter` (String, optional): Start quarter in YYYY-MM-DD format
- `endQuarter` (String, optional): End quarter in YYYY-MM-DD format

**Returns:**

```graphql
type QuarterlyMetrics {
  quarter: String!
  activeSmartMenus: Int!
  totalOrders: Int!
  brands: Int!
  totalLocations: Int!
  qoqGrowth: Float
}
```

## Authentication

### API Key Authentication (Recommended)

Set the `X-API-Key` header with your API key:

```bash
curl -X POST \
  "https://your-lambda-url/graphql" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"query": "..."}'
```

### JWT Authentication

Set the `Authorization` header with a Bearer token:

```bash
curl -X POST \
  "https://your-lambda-url/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"query": "..."}'
```

## Testing

### Test the totalMetrics Query

```bash
# Set your environment variables
export LAMBDA_URL="https://your-lambda-function-url"
export API_KEY="your-api-key"

# Run the test script
node test-total-metrics-real.js
```

### Test with cURL

```bash
# Make the script executable and update the URL/API key
chmod +x test-total-metrics-curl.sh
./test-total-metrics-curl.sh
```

## Data Sources

The function queries the following Athena tables:

- `everybite_analytics.widget_interactions`: Contains order events and session data
- `everybite_analytics.db_widgets`: Contains widget/brand information

## Deployment

Deploy the function using the deployment script:

```bash
cd lambda
./deploy.sh
```

## Environment Variables

Required environment variables:

- `METABASE_SITE_URL`: Metabase instance URL
- `METABASE_USERNAME`: Metabase username
- `METABASE_PASSWORD`: Metabase password
- `API_KEY`: API key for authentication (optional, can be set via script)

## Error Handling

The function includes comprehensive error handling and logging:

- Query execution errors are logged with details
- Authentication failures return appropriate HTTP status codes
- Invalid date formats are handled gracefully
- Empty results are handled without errors

## Monitoring

Check CloudWatch logs for detailed execution information:

- Query execution logs
- Error details
- Performance metrics
- Authentication attempts
