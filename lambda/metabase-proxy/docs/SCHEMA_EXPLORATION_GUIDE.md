# Athena Schema Exploration Guide

This guide shows you how to explore the available Athena tables, columns, and data to help you create accurate queries.

## Method 1: GraphQL Schema Exploration (Recommended)

### Using the Node.js Script

```bash
# Set your environment variables
export LAMBDA_URL="https://your-lambda-function-url"
export API_KEY="your-api-key"

# Run the schema exploration script
node explore-schema.js
```

### Using cURL

```bash
# Update the script with your URL and API key
chmod +x explore-schema-curl.sh
./explore-schema-curl.sh
```

### Using Altair or GraphQL Playground

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

## Method 2: Direct SQL Queries via Metabase

If you have direct access to Metabase, you can run these SQL queries:

### List All Tables

```sql
SHOW TABLES IN everybite_analytics
```

### Describe Table Structure

```sql
DESCRIBE everybite_analytics.widget_interactions
DESCRIBE everybite_analytics.db_widgets
```

### Sample Data

```sql
SELECT * FROM everybite_analytics.widget_interactions LIMIT 5
SELECT * FROM everybite_analytics.db_widgets LIMIT 5
```

### Count Records

```sql
SELECT COUNT(*) FROM everybite_analytics.widget_interactions
SELECT COUNT(*) FROM everybite_analytics.db_widgets
```

### Check Date Ranges

```sql
SELECT
  MIN(event_time) as earliest_date,
  MAX(event_time) as latest_date,
  COUNT(*) as total_records
FROM everybite_analytics.widget_interactions
```

## Method 3: AWS Athena Console

1. Go to AWS Athena Console
2. Select the `everybite_analytics` database
3. Use the query editor to run the same SQL queries above

## Understanding the Data

### widget_interactions Table

This table contains order events and user interactions:

- **event_time**: When the interaction occurred
- **session_id**: Unique identifier for a user session
- **widget_id**: Reference to the widget/brand
- **source**: Where the interaction came from
- **referrer**: The page URL that led to the interaction

### db_widgets Table

This table contains widget/brand information:

- **id**: Unique widget identifier
- **name**: Brand/restaurant name
- **number_of_locations**: Number of locations for this brand
- **published_at**: When the widget was published
- **status**: Current status of the widget

## Common Query Patterns

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

## Tips for Creating New Queries

1. **Always check column names**: Use the schema exploration to get exact column names
2. **Verify data types**: Ensure you're using the correct data type for comparisons
3. **Test with sample data**: Look at the sample data to understand the format
4. **Check for NULL values**: Some columns might have NULL values that need handling
5. **Use proper date casting**: Always cast date strings to timestamp when filtering
6. **Test with small datasets first**: Use LIMIT clauses to test queries before running on full datasets

## Example: Creating a New Query

Let's say you want to create a query for "orders by restaurant":

1. **Explore the schema** to see available columns:

   ```bash
   node explore-schema.js
   ```

2. **Look at sample data** to understand the format:
   - Check if restaurant names are in `widget_interactions` or `db_widgets`
   - See how the tables are related via `widget_id`

3. **Create the query**:

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

4. **Test the query** in Metabase or Athena console

5. **Add it to your GraphQL schema** and resolvers

## Troubleshooting

### Common Issues:

- **Column not found**: Double-check column names from schema exploration
- **Data type mismatch**: Ensure proper casting (e.g., `CAST('2024-01-01' AS timestamp)`)
- **No results**: Check if data exists for your date range
- **Performance issues**: Use LIMIT clauses and proper indexing

### Debugging:

- Use the schema exploration to verify table structure
- Check sample data to understand data format
- Test queries directly in Metabase/Athena first
- Use CloudWatch logs to see query execution details
