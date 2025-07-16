const axios = require("axios");
const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// Metabase session management
let sessionToken = null;
let sessionExpires = null;

// Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-west-1",
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

async function authenticateMetabase() {
  const METABASE_URL = process.env.METABASE_URL;
  const METABASE_USERNAME = process.env.METABASE_USERNAME;
  const METABASE_PASSWORD = process.env.METABASE_PASSWORD;

  if (!METABASE_URL || !METABASE_USERNAME || !METABASE_PASSWORD) {
    throw new Error("Metabase credentials not configured");
  }

  if (sessionToken && sessionExpires && Date.now() < sessionExpires) {
    return sessionToken;
  }

  const response = await axios.post(`${METABASE_URL}/api/session`, {
    username: METABASE_USERNAME,
    password: METABASE_PASSWORD,
  });

  sessionToken = response.data.id;
  // Metabase sessions last 14 days, but we'll refresh every 12 hours
  sessionExpires = Date.now() + 12 * 60 * 60 * 1000;
  return sessionToken;
}

async function fetchMetabase(path) {
  const METABASE_URL = process.env.METABASE_URL;
  if (!METABASE_URL) {
    throw new Error("METABASE_URL not configured");
  }

  const token = await authenticateMetabase();
  const response = await axios.get(`${METABASE_URL}${path}`, {
    headers: { "X-Metabase-Session": token },
  });
  return response.data;
}

// Cognito user management functions
async function listCognitoUsers(userPoolId, queryParams = {}) {
  const { limit = 20, nextToken } = queryParams;

  const command = new ListUsersCommand({
    UserPoolId: userPoolId,
    Limit: parseInt(limit),
    ...(nextToken && { PaginationToken: nextToken }),
  });

  const response = await cognitoClient.send(command);

  return {
    users: response.Users.map((user) => ({
      username: user.Username,
      email: user.Attributes?.find((attr) => attr.Name === "email")?.Value,
      emailVerified:
        user.Attributes?.find((attr) => attr.Name === "email_verified")
          ?.Value === "true",
      status: user.UserStatus,
      enabled: user.Enabled,
      createdAt: user.UserCreateDate,
      lastModified: user.UserLastModifiedDate,
    })),
    nextToken: response.PaginationToken,
  };
}

async function createCognitoUser(userPoolId, userData) {
  const { email, password, firstName, lastName } = userData;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const attributes = [
    { Name: "email", Value: email },
    { Name: "email_verified", Value: "true" },
  ];

  if (firstName) {
    attributes.push({ Name: "given_name", Value: firstName });
  }
  if (lastName) {
    attributes.push({ Name: "family_name", Value: lastName });
  }

  const command = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: attributes,
    TemporaryPassword: password,
    MessageAction: "SUPPRESS", // Don't send welcome email
  });

  const response = await cognitoClient.send(command);

  return {
    message: "User created successfully",
    user: {
      username: response.User.Username,
      email: response.User.Attributes?.find((attr) => attr.Name === "email")
        ?.Value,
      status: response.User.UserStatus,
    },
  };
}

async function deleteCognitoUser(userPoolId, username) {
  const command = new AdminDeleteUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });

  await cognitoClient.send(command);

  return {
    message: "User deleted successfully",
  };
}

async function enableCognitoUser(userPoolId, username) {
  const command = new AdminEnableUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });

  await cognitoClient.send(command);

  return {
    message: "User enabled successfully",
  };
}

async function disableCognitoUser(userPoolId, username) {
  const command = new AdminDisableUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });

  await cognitoClient.send(command);

  return {
    message: "User disabled successfully",
  };
}

async function resetCognitoPassword(userPoolId, username) {
  const command = new AdminSetUserPasswordCommand({
    UserPoolId: userPoolId,
    Username: username,
    Password: generateTemporaryPassword(),
    Permanent: false,
  });

  await cognitoClient.send(command);

  return {
    message: "Password reset successfully",
  };
}

function generateTemporaryPassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Handle both API Gateway and Lambda Function URL formats
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    const path = event.path || event.rawPath;
    const body = event.body;
    const queryStringParameters = event.queryStringParameters;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    // Handle Lambda Function URL path format
    let requestPath = path;
    if (event.rawPath) {
      requestPath = event.rawPath;
    } else if (requestPath) {
      requestPath = requestPath;
    } else {
      requestPath = "/";
    }

    console.log("Debug - Event:", JSON.stringify(event, null, 2));
    console.log("Debug - Request path:", requestPath);
    console.log("Debug - HTTP method:", httpMethod);
    console.log("Debug - Path:", path);
    console.log("Debug - RawPath:", event.rawPath);
    console.log("Debug - Event.httpMethod:", event.httpMethod);
    console.log(
      "Debug - Event.requestContext?.http?.method:",
      event.requestContext?.http?.method
    );

    // Test endpoint
    if (requestPath === "/test") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Test endpoint working",
          requestPath: requestPath,
          path: path,
          rawPath: event.rawPath,
          httpMethod: httpMethod,
        }),
      };
    }
    // Metabase endpoints
    else if (requestPath === "/dashboard") {
      // Fetch dashboard metrics
      const [users, dashboards, questions] = await Promise.all([
        fetchMetabase("/api/user"),
        fetchMetabase("/api/dashboard"),
        fetchMetabase("/api/card"),
      ]);

      const activeUsers = users.data.filter((u) => u.is_active).length;
      const popularDashboards = dashboards.slice(0, 5);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          totalUsers: users.data.length,
          totalDashboards: dashboards.length,
          totalQuestions: questions.length,
          activeUsers,
          popularDashboards,
        }),
      };
    } else if (requestPath === "/metabase/users") {
      // Fetch Metabase users data
      const users = await fetchMetabase("/api/user");

      const transformedUsers = users.data.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.common_name,
        firstName: user.first_name,
        lastName: user.last_name,
        dateJoined: user.date_joined,
        lastLogin: user.last_login,
        isActive: user.is_active,
        isSuperuser: user.is_superuser,
        isQbnewb: user.is_qbnewb,
        locale: user.locale,
        ssoSource: user.sso_source,
        updatedAt: user.updated_at,
      }));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          users: transformedUsers,
          total: users.total,
          limit: users.limit,
          offset: users.offset,
        }),
      };
    }
    // Cognito user management endpoints
    else if (httpMethod === "GET" && requestPath === "/users") {
      console.log("Debug - UserPoolId:", userPoolId);
      if (!userPoolId) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            error: "COGNITO_USER_POOL_ID environment variable is required",
            debug: {
              userPoolId: userPoolId,
              requestPath: requestPath,
              httpMethod: httpMethod,
            },
          }),
        };
      }
      const result = await listCognitoUsers(userPoolId, queryStringParameters);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } else if (httpMethod === "POST" && requestPath === "/users") {
      if (!userPoolId) {
        throw new Error(
          "COGNITO_USER_POOL_ID environment variable is required"
        );
      }
      const result = await createCognitoUser(
        userPoolId,
        JSON.parse(body || "{}")
      );
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } else if (httpMethod === "DELETE" && requestPath.startsWith("/users/")) {
      if (!userPoolId) {
        throw new Error(
          "COGNITO_USER_POOL_ID environment variable is required"
        );
      }
      const username = requestPath.split("/")[2];
      const result = await deleteCognitoUser(userPoolId, username);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } else if (
      httpMethod === "PUT" &&
      requestPath.startsWith("/users/") &&
      requestPath.includes("/enable")
    ) {
      if (!userPoolId) {
        throw new Error(
          "COGNITO_USER_POOL_ID environment variable is required"
        );
      }
      const username = requestPath.split("/")[2];
      const result = await enableCognitoUser(userPoolId, username);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } else if (
      httpMethod === "PUT" &&
      requestPath.startsWith("/users/") &&
      requestPath.includes("/disable")
    ) {
      if (!userPoolId) {
        throw new Error(
          "COGNITO_USER_POOL_ID environment variable is required"
        );
      }
      const username = requestPath.split("/")[2];
      const result = await disableCognitoUser(userPoolId, username);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } else if (
      httpMethod === "PUT" &&
      requestPath.startsWith("/users/") &&
      requestPath.includes("/reset-password")
    ) {
      if (!userPoolId) {
        throw new Error(
          "COGNITO_USER_POOL_ID environment variable is required"
        );
      }
      const username = requestPath.split("/")[2];
      const result = await resetCognitoPassword(userPoolId, username);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Endpoint not found" }),
      };
    }
  } catch (error) {
    console.error("Lambda error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
