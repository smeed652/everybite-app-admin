#!/bin/bash

echo "Finding Cognito User Pools..."

# List all User Pools in the region
USER_POOLS=$(aws cognito-idp list-user-pools --max-results 10 --region us-west-1 --output json)

if [ $? -eq 0 ]; then
    echo "Found User Pools:"
    echo "$USER_POOLS" | jq -r '.UserPools[] | "ID: \(.Id) | Name: \(.Name)"'
    
    echo ""
    echo "To set the User Pool ID on your Lambda function, run:"
    echo "./set-env.sh"
    echo ""
    echo "Then edit set-env.sh and replace 'us-west-1_YOUR_USER_POOL_ID' with the actual ID from above."
else
    echo "Error: Could not list User Pools. Please check your AWS credentials and region."
    echo ""
    echo "You can also manually find your User Pool ID by:"
    echo "1. Going to AWS Console → Cognito → User Pools"
    echo "2. Finding your User Pool"
    echo "3. Copying the Pool ID (format: us-west-1_XXXXXXX)"
    echo ""
    echo "Then run: ./set-env.sh and update the ID in the script."
fi 