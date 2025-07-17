#!/bin/bash

# Configuration
REGION="us-west-1"
DATABASE="everybite_analytics"
OUTPUT_LOCATION="s3://your-query-results-bucket/athena-results/"

echo "🔍 Getting Athena schema (Simple Version)..."
echo "📍 Region: $REGION"
echo "🗄️  Database: $DATABASE"
echo ""

# Function to execute a single query and show results
run_query() {
    local query="$1"
    local description="$2"
    
    echo "📋 $description"
    echo "🔧 Query: $query"
    
    # Start query
    local query_id=$(aws athena start-query-execution \
        --query-string "$query" \
        --query-execution-context Database="$DATABASE" \
        --result-configuration OutputLocation="$OUTPUT_LOCATION" \
        --region "$REGION" \
        --query 'QueryExecutionId' \
        --output text)
    
    # Wait for completion
    while true; do
        local status=$(aws athena get-query-execution \
            --query-execution-id "$query_id" \
            --region "$REGION" \
            --query 'QueryExecution.Status.State' \
            --output text)
        
        if [ "$status" = "SUCCEEDED" ]; then
            break
        elif [ "$status" = "FAILED" ] || [ "$status" = "CANCELLED" ]; then
            echo "❌ Query failed: $status"
            return 1
        fi
        sleep 1
    done
    
    # Show results
    echo "📊 Results:"
    aws athena get-query-results \
        --query-execution-id "$query_id" \
        --region "$REGION" \
        --query 'ResultSet.Rows[*].Data[*].VarCharValue' \
        --output table
    
    echo ""
    echo "---"
    echo ""
}

# Check AWS CLI
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Check S3 bucket
if [ "$OUTPUT_LOCATION" = "s3://your-query-results-bucket/athena-results/" ]; then
    echo "❌ Update OUTPUT_LOCATION with your S3 bucket"
    echo "💡 Find it in AWS Athena Console → Settings → Query result location"
    exit 1
fi

echo "🔐 AWS Identity: $(aws sts get-caller-identity --query 'Arn' --output text)"
echo ""

# Essential schema queries
echo "📋 ESSENTIAL SCHEMA INFORMATION"
echo "================================"
echo ""

run_query "SHOW TABLES IN $DATABASE" "All Tables in Database"

run_query "DESCRIBE $DATABASE.widget_interactions" "widget_interactions Schema"

run_query "DESCRIBE $DATABASE.db_widgets" "db_widgets Schema"

run_query "SELECT * FROM $DATABASE.widget_interactions LIMIT 2" "Sample widget_interactions Data"

run_query "SELECT * FROM $DATABASE.db_widgets LIMIT 2" "Sample db_widgets Data"

run_query "SELECT COUNT(*) as total_records FROM $DATABASE.widget_interactions" "Total Records in widget_interactions"

run_query "SELECT MIN(event_time) as earliest, MAX(event_time) as latest FROM $DATABASE.widget_interactions" "Date Range in widget_interactions"

echo "✅ Schema exploration completed!"
echo ""
echo "💡 Use these exact column names and data types in your queries!" 