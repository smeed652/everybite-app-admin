#!/bin/bash

echo "Adding Cognito permissions to Lambda execution role..."

# Get the Lambda function configuration to find the execution role
ROLE_ARN=$(aws lambda get-function-configuration \
  --function-name metabase-proxy-dev \
  --region us-west-1 \
  --query 'Role' \
  --output text)

echo "Lambda execution role: $ROLE_ARN"

# Extract the role name from the ARN
ROLE_NAME=$(echo $ROLE_ARN | sed 's/.*role\///')

echo "Role name: $ROLE_NAME"

# Create a policy document for Cognito permissions
cat > cognito-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:ListUsers",
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminDeleteUser",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminEnableUser",
                "cognito-idp:AdminDisableUser"
            ],
            "Resource": "arn:aws:cognito-idp:us-west-1:865022066059:userpool/us-west-1_HuVwywmH1"
        }
    ]
}
EOF

# Attach the policy to the role
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name CognitoUserManagementPolicy \
  --policy-document file://cognito-policy.json

if [ $? -eq 0 ]; then
    echo "Successfully added Cognito permissions to Lambda execution role!"
    echo "Cleaning up temporary files..."
    rm cognito-policy.json
else
    echo "Error: Failed to add Cognito permissions."
    echo "You may need to manually add the permissions through the AWS Console:"
    echo "1. Go to IAM → Roles → $ROLE_NAME"
    echo "2. Add inline policy with the permissions from cognito-policy.json"
    echo "3. Use a valid policy name like 'CognitoUserManagementPolicy'"
fi 