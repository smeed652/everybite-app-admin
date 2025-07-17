#!/bin/bash

# Configuration
REGION="us-west-1"
DATABASE="everybite_analytics"
CATALOG="AwsDataCatalog"
OUTPUT_LOCATION="s3://your-query-results-bucket/athena-results/"

echo "🔍 Getting Athena schema using AWS CLI..."
echo "📍 Region: $REGION"
echo "🗄️  Database: $DATABASE"
echo ""

# Function to execute Athena query and get results
execute_athena_query() {
    local query="$1"
    local query_name="$2"
    
    echo "📋 Executing: $query_name"
    echo "🔧 Query: $query"
    echo ""
    
    # Start query execution
    local query_execution_id=$(aws athena start-query-execution \
        --query-string "$query" \
        --query-execution-context Database="$DATABASE" \
        --result-configuration OutputLocation="$OUTPUT_LOCATION" \
        --region "$REGION" \
        --query 'QueryExecutionId' \
        --output text)
    
    echo "🚀 Query started with ID: $query_execution_id"
    
    # Wait for query to complete
    echo "⏳ Waiting for query to complete..."
    while true; do
        local status=$(aws athena get-query-execution \
            --query-execution-id "$query_execution_id" \
            --region "$REGION" \
            --query 'QueryExecution.Status.State' \
            --output text)
        
        if [ "$status" = "SUCCEEDED" ]; then
            echo "✅ Query completed successfully"
            break
        elif [ "$status" = "FAILED" ] || [ "$status" = "CANCELLED" ]; then
            echo "❌ Query failed with status: $status"
            return 1
        fi
        
        echo "⏳ Status: $status, waiting..."
        sleep 2
    done
    
    # Get results
    echo "📊 Results:"
    echo "----------------------------------------"
    aws athena get-query-results \
        --query-execution-id "$query_execution_id" \
        --region "$REGION" \
        --query 'ResultSet.Rows[*].Data[*].VarCharValue' \
        --output table
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if required parameters are set
if [ "$OUTPUT_LOCATION" = "s3://your-query-results-bucket/athena-results/" ]; then
    echo "❌ Please update OUTPUT_LOCATION in the script with your S3 bucket"
    echo "Example: s3://my-athena-results-bucket/athena-results/"
    exit 1
fi

echo "🔐 AWS Identity:"
aws sts get-caller-identity --query 'Arn' --output text
echo ""

# Execute schema queries
echo "📋 SCHEMA EXPLORATION QUERIES"
echo "=============================="
echo ""

# 1. List all tables
execute_athena_query "SHOW TABLES IN $DATABASE" "List All Tables"

# 2. Describe widget_interactions table
execute_athena_query "DESCRIBE $DATABASE.widget_interactions" "Describe widget_interactions Table"

# 3. Describe db_widgets table
execute_athena_query "DESCRIBE $DATABASE.db_widgets" "Describe db_widgets Table"

# 4. Get sample data from widget_interactions
execute_athena_query "SELECT * FROM $DATABASE.widget_interactions LIMIT 3" "Sample widget_interactions Data"

# 5. Get sample data from db_widgets
execute_athena_query "SELECT * FROM $DATABASE.db_widgets LIMIT 3" "Sample db_widgets Data"

# 6. Get data statistics
execute_athena_query "SELECT COUNT(*) as total_records FROM $DATABASE.widget_interactions" "Total Records in widget_interactions"

execute_athena_query "SELECT COUNT(*) as total_records FROM $DATABASE.db_widgets" "Total Records in db_widgets"

# 7. Get date range information
execute_athena_query "SELECT MIN(event_time) as earliest_date, MAX(event_time) as latest_date, COUNT(*) as total_records FROM $DATABASE.widget_interactions" "Date Range in widget_interactions"

echo "✅ Schema exploration completed!"
echo ""
echo "💡 TIPS:"
echo "• Use these column names when creating new queries"
echo "• Check data types to ensure proper filtering"
echo "• Sample data shows the actual data format"
echo "• Date ranges help you understand available data periods" 