# Getting Athena Schema from AWS

This guide shows you how to get the schema of Athena tables directly from AWS using different methods.

## Method 1: AWS Athena Console (Recommended - No Setup Required)

### Step 1: Access Athena Console

1. Go to [AWS Athena Console](https://console.aws.amazon.com/athena/)
2. Make sure you're in the **us-west-1** region
3. Select the `everybite_analytics` database from the dropdown

### Step 2: Run Schema Queries

Copy and paste these queries one by one:

```sql
-- 1. List all tables in the database
SHOW TABLES IN everybite_analytics;

-- 2. Get detailed schema for widget_interactions table
DESCRIBE everybite_analytics.widget_interactions;

-- 3. Get detailed schema for db_widgets table
DESCRIBE everybite_analytics.db_widgets;

-- 4. See sample data from widget_interactions
SELECT * FROM everybite_analytics.widget_interactions LIMIT 5;

-- 5. See sample data from db_widgets
SELECT * FROM everybite_analytics.db_widgets LIMIT 5;

-- 6. Get record counts
SELECT COUNT(*) as total_records FROM everybite_analytics.widget_interactions;
SELECT COUNT(*) as total_records FROM everybite_analytics.db_widgets;

-- 7. Get date range information
SELECT
  MIN(event_time) as earliest_date,
  MAX(event_time) as latest_date,
  COUNT(*) as total_records
FROM everybite_analytics.widget_interactions;
```

### Step 3: Understand the Results

- **SHOW TABLES**: Lists all available tables
- **DESCRIBE**: Shows column names, data types, and comments
- **SELECT \* LIMIT 5**: Shows sample data to understand format
- **COUNT**: Shows how much data you have
- **Date range**: Shows the time period of available data

## Method 2: AWS CLI Script

### Prerequisites

1. Install AWS CLI: `pip install awscli` or download from AWS website
2. Configure AWS credentials: `aws configure`
3. Update the script with your S3 bucket for query results

### Usage

```bash
# Update the OUTPUT_LOCATION in the script first
# Then run:
./get-athena-schema.sh
```

### What the script does:

- Lists all tables in the database
- Describes the structure of `widget_interactions` and `db_widgets`
- Shows sample data from both tables
- Gets record counts and date ranges
- Displays results in a formatted table

## Method 3: Node.js Script with AWS SDK

### Prerequisites

1. Install AWS SDK: `npm install aws-sdk`
2. Configure AWS credentials: `aws configure`
3. Update the script with your S3 bucket for query results

### Usage

```bash
# Update the OUTPUT_LOCATION in the script first
# Then run:
node get-athena-schema.js
```

## Method 4: Direct AWS CLI Commands

If you prefer to run commands manually:

```bash
# 1. List all tables
aws athena start-query-execution \
  --query-string "SHOW TABLES IN everybite_analytics" \
  --query-execution-context Database=everybite_analytics \
  --result-configuration OutputLocation=s3://your-bucket/athena-results/ \
  --region us-west-1

# 2. Describe widget_interactions table
aws athena start-query-execution \
  --query-string "DESCRIBE everybite_analytics.widget_interactions" \
  --query-execution-context Database=everybite_analytics \
  --result-configuration OutputLocation=s3://your-bucket/athena-results/ \
  --region us-west-1

# 3. Get sample data
aws athena start-query-execution \
  --query-string "SELECT * FROM everybite_analytics.widget_interactions LIMIT 5" \
  --query-execution-context Database=everybite_analytics \
  --result-configuration OutputLocation=s3://your-bucket/athena-results/ \
  --region us-west-1
```

## Understanding the Schema Output

### DESCRIBE Output Format

```
col_name        data_type       comment
event_time      timestamp       When the interaction occurred
session_id      varchar         Unique session identifier
widget_id       varchar         Reference to widget/brand
source          varchar         Source of the interaction
referrer        varchar         Page URL that led to interaction
```

### Key Information to Look For:

1. **Column Names**: Exact names to use in queries
2. **Data Types**: How to properly filter and cast data
3. **Comments**: Description of what each column contains
4. **Sample Data**: Actual format of the data

## Common Schema Queries

### For Any Table:

```sql
-- Basic schema
DESCRIBE database_name.table_name;

-- Extended schema (if available)
DESCRIBE EXTENDED database_name.table_name;

-- Sample data
SELECT * FROM database_name.table_name LIMIT 10;

-- Column count
SELECT COUNT(*) FROM database_name.table_name;

-- Check for NULL values
SELECT
  column_name,
  COUNT(*) as total_rows,
  COUNT(column_name) as non_null_rows,
  COUNT(*) - COUNT(column_name) as null_rows
FROM database_name.table_name
GROUP BY column_name;
```

### For Date Columns:

```sql
-- Date range
SELECT
  MIN(date_column) as earliest_date,
  MAX(date_column) as latest_date,
  COUNT(*) as total_records
FROM database_name.table_name;

-- Data by year/month
SELECT
  YEAR(date_column) as year,
  MONTH(date_column) as month,
  COUNT(*) as records
FROM database_name.table_name
GROUP BY YEAR(date_column), MONTH(date_column)
ORDER BY year DESC, month DESC;
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Ensure your AWS credentials have Athena access
2. **No Results**: Check if the database/table exists
3. **S3 Bucket Required**: Athena needs an S3 bucket for query results
4. **Region Mismatch**: Make sure you're in the correct AWS region

### Error Messages:

- `Table not found`: Check table name spelling
- `Database not found`: Verify database name
- `Access denied`: Check IAM permissions
- `No output location`: Configure S3 bucket for results

## Next Steps

Once you have the schema:

1. **Note exact column names** for use in queries
2. **Check data types** for proper filtering
3. **Review sample data** to understand format
4. **Use the information** when asking for new GraphQL queries

## Example: Using Schema Info for Queries

After running schema exploration, you might find:

- `widget_interactions` has columns: `event_time`, `session_id`, `widget_id`, `source`
- `db_widgets` has columns: `id`, `name`, `number_of_locations`, `published_at`

Then you can create accurate queries like:

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
