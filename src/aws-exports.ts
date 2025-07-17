interface AwsExports {
  aws_project_region: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  oauth: Record<string, unknown>;
  aws_cognito_username_attributes: string[];
  aws_cognito_social_providers: string[];
  aws_cognito_signup_attributes: string[];
  aws_cognito_mfa_configuration: string;
  aws_cognito_mfa_types: string[];
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: number;
    passwordPolicyCharacters: string[];
  };
  aws_credentials: {
    region: string;
  };
}

const awsExports: AwsExports = {
  aws_project_region: "us-west-1",
  aws_cognito_region: "us-west-1",
  aws_user_pools_id:
    import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-west-1_HuVwywmH1",
  aws_user_pools_web_client_id:
    import.meta.env.VITE_COGNITO_CLIENT_ID || "746d7c6ituu4n572hef100m5s7",
  oauth: {},
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: [],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_credentials: {
    region: "us-west-1",
  },
};

export default awsExports;
