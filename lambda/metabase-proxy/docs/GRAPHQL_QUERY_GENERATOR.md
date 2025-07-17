# GraphQL Query Generator Guide

This guide helps you quickly generate GraphQL queries based on the Athena schema.

## Quick Reference

### Table Relationships

- `widget_interactions` ←→ `db_widgets` (via `widget_id`)

### Key Columns

- **Time**: `event_time` (timestamp)
- **Orders**: `COUNT(*)` from widget_interactions
- **Diners**: `COUNT(DISTINCT session_id)` from widget_interactions
- **Restaurants**: `name` from db_widgets
- **Locations**: `number_of_locations` from db_widgets

## Query Templates

### 1. Total Metrics (Orders + Diners)

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

**Variables:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### 2. Daily Orders Trend

```graphql
query GetDailyOrders($startDate: String, $endDate: String) {
  dailyOrders(startDate: $startDate, endDate: $endDate) {
    date
    count
  }
}
```

### 3. Quarterly Metrics

```graphql
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

## Common Query Patterns

### Date Range Queries

```graphql
# Last 30 days
{
  "startDate": "2024-12-16",
  "endDate": "2025-01-15"
}

# Q1 2024
{
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}

# Full year
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Testing Queries

```bash
# Test with cURL
curl -X POST \
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query GetTotalMetrics($startDate: String!, $endDate: String!) { totalMetrics(startDate: $startDate, endDate: $endDate) { totalOrders totalDinerVisits startDate endDate } }",
    "variables": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }'
```

## Schema-Based Query Generation

### When you need: **Orders by Restaurant**

**SQL Pattern:**

```sql
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

**GraphQL Query:** (Would need to be added to schema)

```graphql
query GetOrdersByRestaurant($startDate: String!, $endDate: String!) {
  ordersByRestaurant(startDate: $startDate, endDate: $endDate) {
    restaurantName
    totalOrders
    uniqueDiners
  }
}
```

### When you need: **Top Performing Widgets**

**SQL Pattern:**

```sql
SELECT
  w.name as widget_name,
  COUNT(*) as total_orders,
  COUNT(DISTINCT i.session_id) as unique_sessions
FROM everybite_analytics.widget_interactions i
LEFT JOIN everybite_analytics.db_widgets w ON i.widget_id = w.id
WHERE i.event_time >= CAST('2024-01-01' AS timestamp)
GROUP BY w.id, w.name
ORDER BY total_orders DESC
LIMIT 10
```

### When you need: **Daily Orders with Restaurant Info**

**SQL Pattern:**

```sql
SELECT
  date_trunc('day', i.event_time) as day,
  w.name as restaurant_name,
  COUNT(*) as orders
FROM everybite_analytics.widget_interactions i
LEFT JOIN everybite_analytics.db_widgets w ON i.widget_id = w.id
WHERE i.event_time >= CAST('2024-01-01' AS timestamp)
GROUP BY date_trunc('day', i.event_time), w.name
ORDER BY day, orders DESC
```

## Adding New Queries

To add a new GraphQL query:

1. **Add to Schema** (`schema/analytics.js`):

```graphql
type RestaurantOrders {
  restaurantName: String!
  totalOrders: Int!
  uniqueDiners: Int!
}

type Query {
  # ... existing queries
  ordersByRestaurant(startDate: String!, endDate: String!): [RestaurantOrders!]!
}
```

2. **Add to Resolvers** (`resolvers/analytics.js`):

```javascript
ordersByRestaurant: async (
  _,
  { startDate, endDate },
  { executeMetabaseQuery }
) => {
  // Implementation here
};
```

3. **Add to Queries** (`queries/analytics.js`):

```javascript
ordersByRestaurant: {
  database: 2,
  type: "native",
  native: {
    query: `
      SELECT
        w.name as restaurant_name,
        COUNT(*) as total_orders,
        COUNT(DISTINCT i.session_id) as unique_diners
      FROM everybite_analytics.widget_interactions i
      LEFT JOIN everybite_analytics.db_widgets w ON i.widget_id = w.id
      WHERE i.event_time >= CAST('{{startDate}}' AS timestamp)
        AND i.event_time <= CAST('{{endDate}}' AS timestamp)
      GROUP BY w.name
      ORDER BY total_orders DESC
    `
  }
}
```

## Best Practices

1. **Always use date filtering** to limit data scanning
2. **Use proper data types** (cast strings to timestamp)
3. **Handle NULL values** in your queries
4. **Test with small date ranges** first
5. **Use LIMIT clauses** for testing
6. **Join tables properly** using foreign keys

## Error Handling

### Common GraphQL Errors:

- `Cannot query field "fieldName"`: Field doesn't exist in schema
- `Variable "$varName" of type "String!"`: Missing required variable
- `Field "fieldName" of type "Type" must have a selection`: Need to select subfields

### Debugging:

1. Check the schema documentation for exact field names
2. Verify variable types match schema requirements
3. Use GraphQL introspection to see available fields
4. Test with simple queries first

## Testing Checklist

- [ ] Query syntax is valid GraphQL
- [ ] All required variables are provided
- [ ] Date formats are correct (YYYY-MM-DD)
- [ ] Authentication headers are set
- [ ] Response contains expected data
- [ ] Error handling works for edge cases

This guide provides everything needed to generate accurate GraphQL queries based on the Athena schema.
