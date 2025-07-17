# Athena Schema Documentation

This document contains the complete schema information for the Athena database, generated for GraphQL query creation.

## Database Information

- **Database Name**: everybite_analytics
- **Region**: us-west-1
- **Generated**: 2025-01-15T18:30:00.000Z

## Available Tables

### All Tables

- `widget_interactions` - Contains order events and user interactions
- `db_widgets` - Contains widget/brand information
- `widget_viewed` - Contains widget view events (if exists)

## widget_interactions Table

### Schema

| Column Name  | Data Type   | Description                      |
| ------------ | ----------- | -------------------------------- |
| `event_time` | `timestamp` | When the interaction occurred    |
| `session_id` | `varchar`   | Unique session identifier        |
| `widget_id`  | `varchar`   | Reference to widget/brand        |
| `source`     | `varchar`   | Source of the interaction        |
| `referrer`   | `varchar`   | Page URL that led to interaction |

### Sample Data

```
Row 1: 2024-01-15 10:30:00 | session_123 | widget_456 | widget | https://example.com
Row 2: 2024-01-15 11:45:00 | session_124 | widget_457 | widget | https://example.com
```

### Key Information

- **Primary Key**: No explicit primary key, but `session_id` + `event_time` combination is unique
- **Foreign Key**: `widget_id` references `db_widgets.id`
- **Time Range**: Contains data from 2024 onwards
- **Data Volume**: Millions of records

## db_widgets Table

### Schema

| Column Name           | Data Type   | Description                        |
| --------------------- | ----------- | ---------------------------------- |
| `id`                  | `varchar`   | Unique widget identifier           |
| `name`                | `varchar`   | Brand/restaurant name              |
| `number_of_locations` | `int`       | Number of locations for this brand |
| `published_at`        | `timestamp` | When the widget was published      |
| `status`              | `varchar`   | Current status of the widget       |

### Sample Data

```
Row 1: widget_456 | Pizza Palace | 5 | 2024-01-01 00:00:00 | active
Row 2: widget_457 | Burger Joint | 3 | 2024-01-02 00:00:00 | active
```

### Key Information

- **Primary Key**: `id`
- **Business Logic**: Only active widgets should be considered for analytics
- **Data Volume**: Hundreds of widgets

## GraphQL Query Examples

### Basic Queries

```graphql
# Get total orders between dates
query GetTotalOrders($startDate: String!, $endDate: String!) {
  totalMetrics(startDate: $startDate, endDate: $endDate) {
    totalOrders
    totalDinerVisits
    startDate
    endDate
  }
}
```

```graphql
# Get daily orders
query GetDailyOrders($startDate: String, $endDate: String) {
  dailyOrders(startDate: $startDate, endDate: $endDate) {
    date
    count
  }
}
```

```graphql
# Get quarterly metrics
query GetQuarterlyMetrics($startQuarter: String, $endQuarter: String) {
  quarterlyMetrics(startQuarter: $startQuarter, endQuarter: $endQuarter) {
    quarter
    activeSmartMenus
    totalOrders
    brands
    totalLocations
    qoqGrowth
  }
}
```

### Schema Exploration

```graphql
query ExploreSchema {
  schemaExploration {
    tables {
      tableName
    }
    widgetInteractionsColumns {
      columnName
      dataType
      comment
    }
    dbWidgetsColumns {
      columnName
      dataType
      comment
    }
    widgetInteractionsSample {
      values
    }
    dbWidgetsSample {
      values
    }
  }
}
```

## SQL Query Patterns

### Date Filtering

```sql
-- Filter by date range
WHERE event_time >= CAST('2024-01-01' AS timestamp)
  AND event_time <= CAST('2024-12-31' AS timestamp)

-- Filter by relative dates
WHERE event_time >= current_date - INTERVAL '30 days'
```

### Aggregations

```sql
-- Count total orders
COUNT(*)

-- Count unique sessions (diners)
COUNT(DISTINCT session_id)

-- Count unique widgets
COUNT(DISTINCT widget_id)

-- Count unique brands
COUNT(DISTINCT name)
```

### Joins

```sql
-- Join widget_interactions with db_widgets
FROM everybite_analytics.widget_interactions i
LEFT JOIN everybite_analytics.db_widgets w ON i.widget_id = w.id

-- Get orders by restaurant name
SELECT
  w.name as restaurant_name,
  COUNT(*) as total_orders,
  COUNT(DISTINCT i.session_id) as unique_diners
FROM everybite_analytics.widget_interactions i
LEFT JOIN everybite_analytics.db_widgets w ON i.widget_id = w.id
WHERE i.event_time >= CAST('2024-01-01' AS timestamp)
GROUP BY w.name
ORDER BY total_orders DESC
```

### Grouping

```sql
-- Group by day
GROUP BY date_trunc('day', event_time)

-- Group by quarter
GROUP BY date_trunc('quarter', event_time)

-- Group by widget
GROUP BY widget_id
```

## Usage Notes

1. **Column Names**: Use exact column names as shown in the schema
2. **Data Types**: Pay attention to data types for proper filtering
3. **Date Casting**: Always cast date strings to timestamp when filtering
4. **Sample Data**: Reference sample data to understand actual data format
5. **Table Relationships**: widget_interactions.widget_id → db_widgets.id
6. **NULL Handling**: Some columns might have NULL values that need handling

## Common Use Cases

1. **Total Orders by Date Range**: Use totalMetrics query
2. **Daily Order Trends**: Use dailyOrders query
3. **Orders by Restaurant**: Join widget_interactions with db_widgets
4. **Unique Diners**: Use COUNT(DISTINCT session_id)
5. **Widget Performance**: Group by widget_id and aggregate
6. **Brand Analytics**: Group by db_widgets.name
7. **Location Analysis**: Use number_of_locations from db_widgets

## Query Optimization Tips

1. **Use LIMIT clauses** when testing queries
2. **Filter by date ranges** to reduce data scanning
3. **Use proper JOINs** instead of subqueries when possible
4. **Group by appropriate columns** for aggregations
5. **Use DISTINCT** carefully as it can be expensive

## Error Handling

### Common Issues:

- **Column not found**: Double-check column names from schema
- **Data type mismatch**: Ensure proper casting (e.g., `CAST('2024-01-01' AS timestamp)`)
- **No results**: Check if data exists for your date range
- **Performance issues**: Use LIMIT clauses and proper indexing

### Debugging:

- Use the schema exploration to verify table structure
- Check sample data to understand data format
- Test queries directly in Metabase/Athena first
- Use CloudWatch logs to see query execution details

## GraphQL Schema Reference

### Available Queries:

- `totalMetrics(startDate: String!, endDate: String!): TotalMetrics!`
- `dailyOrders(startDate: String, endDate: String): [DailyOrders!]!`
- `quarterlyMetrics(startQuarter: String, endQuarter: String): [QuarterlyMetrics!]!`
- `schemaExploration: SchemaExploration!`

### Types:

- `TotalMetrics`: Contains totalOrders, totalDinerVisits, startDate, endDate
- `DailyOrders`: Contains date and count
- `QuarterlyMetrics`: Contains quarter, activeSmartMenus, totalOrders, brands, totalLocations, qoqGrowth
- `SchemaExploration`: Contains tables, columns, and sample data

## Authentication

### JWT Authentication:

```bash
curl -X POST \
  "https://your-lambda-url/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"query": "..."}'
```

### API Key Authentication:

```bash
curl -X POST \
  "https://your-lambda-url/graphql" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"query": "..."}'
```

## Testing

### Test Queries:

```bash
# Test totalMetrics
node test-total-metrics-real.js

# Test with cURL
./test-total-metrics-curl.sh

# Explore schema
node explore-schema.js
```

This documentation provides all the information needed to create accurate and efficient GraphQL queries for the Athena analytics data.
