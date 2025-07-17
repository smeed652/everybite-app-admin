#!/bin/bash

# Configuration
REGION="us-west-1"
DATABASE="everybite_analytics"
CATALOG="AwsDataCatalog"
OUTPUT_LOCATION="s3://your-query-results-bucket/athena-results/"

echo "🔍 Getting COMPLETE Athena schema using AWS CLI..."
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

# Function to get all tables and their schemas
get_all_table_schemas() {
    echo "📋 GETTING ALL TABLE SCHEMAS"
    echo "=============================="
    echo ""
    
    # First, get list of all tables
    echo "🔍 Getting list of all tables..."
    local tables_query_execution_id=$(aws athena start-query-execution \
        --query-string "SHOW TABLES IN $DATABASE" \
        --query-execution-context Database="$DATABASE" \
        --result-configuration OutputLocation="$OUTPUT_LOCATION" \
        --region "$REGION" \
        --query 'QueryExecutionId' \
        --output text)
    
    # Wait for tables query to complete
    while true; do
        local status=$(aws athena get-query-execution \
            --query-execution-id "$tables_query_execution_id" \
            --region "$REGION" \
            --query 'QueryExecution.Status.State' \
            --output text)
        
        if [ "$status" = "SUCCEEDED" ]; then
            break
        elif [ "$status" = "FAILED" ] || [ "$status" = "CANCELLED" ]; then
            echo "❌ Failed to get tables list"
            return 1
        fi
        sleep 2
    done
    
    # Get table names
    local tables=$(aws athena get-query-results \
        --query-execution-id "$tables_query_execution_id" \
        --region "$REGION" \
        --query 'ResultSet.Rows[*].Data[0].VarCharValue' \
        --output text)
    
    echo "📋 Found tables: $tables"
    echo ""
    
    # For each table, get its schema
    for table in $tables; do
        echo "🔧 Getting schema for table: $table"
        execute_athena_query "DESCRIBE $DATABASE.$table" "Schema for $table"
        
        echo "📊 Getting sample data for table: $table"
        execute_athena_query "SELECT * FROM $DATABASE.$table LIMIT 3" "Sample data for $table"
        
        echo "📈 Getting record count for table: $table"
        execute_athena_query "SELECT COUNT(*) as total_records FROM $DATABASE.$table" "Record count for $table"
        
        echo ""
        echo "=".repeat(60)
        echo ""
    done
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
    echo ""
    echo "💡 You can find your S3 bucket by:"
    echo "   1. Going to AWS Athena Console"
    echo "   2. Looking at the 'Query result location' setting"
    echo "   3. Or checking your Lambda function's environment variables"
    exit 1
fi

echo "🔐 AWS Identity:"
aws sts get-caller-identity --query 'Arn' --output text
echo ""

# Get complete schema information
get_all_table_schemas

# Additional useful queries
echo "📋 ADDITIONAL SCHEMA INFORMATION"
echo "================================="
echo ""

# Get database information
execute_athena_query "SHOW DATABASES" "All Databases"

# Get catalog information
execute_athena_query "SHOW CATALOGS" "All Catalogs"

# Get detailed information about specific tables (if they exist)
if echo "$tables" | grep -q "widget_interactions"; then
    echo "🔍 Getting detailed info for widget_interactions..."
    execute_athena_query "DESCRIBE EXTENDED $DATABASE.widget_interactions" "Extended schema for widget_interactions"
    
    # Get date range information
    execute_athena_query "SELECT MIN(event_time) as earliest_date, MAX(event_time) as latest_date, COUNT(*) as total_records FROM $DATABASE.widget_interactions" "Date range for widget_interactions"
    
    # Get data distribution
    execute_athena_query "SELECT COUNT(DISTINCT widget_id) as unique_widgets, COUNT(DISTINCT session_id) as unique_sessions FROM $DATABASE.widget_interactions" "Data distribution for widget_interactions"
fi

if echo "$tables" | grep -q "db_widgets"; then
    echo "🔍 Getting detailed info for db_widgets..."
    execute_athena_query "DESCRIBE EXTENDED $DATABASE.db_widgets" "Extended schema for db_widgets"
    
    # Get widget statistics
    execute_athena_query "SELECT COUNT(*) as total_widgets, COUNT(DISTINCT name) as unique_brands, SUM(number_of_locations) as total_locations FROM $DATABASE.db_widgets" "Widget statistics for db_widgets"
fi

echo "✅ Complete schema exploration finished!"
echo ""
echo "💡 SUMMARY OF WHAT YOU LEARNED:"
echo "• All available tables in the database"
echo "• Complete column schemas for each table"
echo "• Sample data to understand format"
echo "• Record counts and data distribution"
echo "• Date ranges for time-based data"
echo ""
echo "🎯 NEXT STEPS:"
echo "• Use exact column names in your queries"
echo "• Check data types for proper filtering"
echo "• Reference sample data for format understanding"
echo "• Use this information when creating new GraphQL queries" 