const axios = require("axios");
const { graphql } = require("graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// JWT validator removed - using API key authentication only

// Import GraphQL schema and resolvers
const analyticsSchema = require("./schema/analytics");
const analyticsResolvers = require("./resolvers/analytics");
const tableResolvers = require("./resolvers/table-resolvers");

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs: [analyticsSchema],
  resolvers: [analyticsResolvers, tableResolvers],
});

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

// Authentication middleware - API key only
async function authenticateRequest(event, requiredRoles = []) {
  const apiKey = event.headers?.["x-api-key"] || event.headers?.["X-API-Key"];

  try {
    // Check for API key
    if (!apiKey) {
      throw new Error("API key required");
    }

    const validApiKey = process.env.API_KEY;
    if (!validApiKey) {
      throw new Error("API key authentication not configured");
    }

    if (apiKey !== validApiKey) {
      throw new Error("Invalid API key");
    }

    // API key authentication successful - return a mock user with admin role
    return {
      sub: "api-key-user",
      "cognito:groups": ["ADMIN"],
      email: "api-key@everybite.com",
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

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

async function executeMetabaseQuery(queryData) {
  const METABASE_URL = process.env.METABASE_URL;
  if (!METABASE_URL) {
    throw new Error("METABASE_URL not configured");
  }

  const token = await authenticateMetabase();
  const response = await axios.post(`${METABASE_URL}/api/dataset`, queryData, {
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
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create Apollo Server
// const server = new ApolloServer({
//   typeDefs: [analyticsSchema],
//   resolvers: [analyticsResolvers],
//   formatError: (error) => {
//     console.error("GraphQL Error:", error);
//     return {
//       message: error.message,
//       path: error.path,
//     };
//   },
//   introspection: true,
// });

// Create GraphQL handler
const graphqlHandler = async (event, context) => {
  console.log("GraphQL Request received:", JSON.stringify(event, null, 2));

  const httpMethod = event.httpMethod;
  const path = event.path;
  let body = event.body;
  const queryStringParameters = event.queryStringParameters;

  // Handle preflight requests
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Authenticate request
    const decodedToken = await authenticateRequest(event, []); // No specific roles required for this endpoint

    // Parse body if it's a string
    let query, variables;
    if (body) {
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Invalid JSON body" }),
          };
        }
      }
      query = body.query;
      variables = body.variables;
    } else if (queryStringParameters) {
      query = queryStringParameters.query;
      variables = queryStringParameters.variables;
    }

    if (!query) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "No query provided" }),
      };
    }

    const result = await graphql({
      schema: schema,
      source: query,
      variableValues: variables,
      contextValue: {
        executeMetabaseQuery,
        fetchMetabase,
        event,
        context,
      },
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(
      "GraphQL Handler Error:",
      error && error.stack ? error.stack : error
    );
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error:
          (error && (error.message || error.toString())) || "Unknown error",
        stack: error && error.stack,
      }),
    };
  }
};

// Main Lambda handler
exports.handler = async (event, context) => {
  console.log("Event structure:", JSON.stringify(event, null, 2));

  // Extract path from different event structures
  let path, httpMethod, queryStringParameters, body;

  if (event.requestContext && event.requestContext.http) {
    // Lambda URL HTTP request
    path = event.rawPath || event.requestContext.http.path;
    httpMethod = event.requestContext.http.method;
    queryStringParameters = event.queryStringParameters;
    body = event.body;
  } else {
    // Direct Lambda invocation or API Gateway
    path = event.path;
    httpMethod = event.httpMethod;
    queryStringParameters = event.queryStringParameters;
    body = event.body;
  }

  const userPoolId = process.env.COGNITO_USER_POOL_ID;

  console.log("Extracted values:", {
    httpMethod,
    path,
    queryStringParameters,
    body,
  });

  // Handle preflight requests
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Handle GraphQL requests
    if (path === "/graphql" || path.endsWith("/graphql")) {
      return await graphqlHandler(event, context);
    }

    // Authenticate request for non-GraphQL endpoints
    const decodedToken = await authenticateRequest(event, []); // No specific roles required for this endpoint

    // Handle REST endpoints for backward compatibility
    const requestPath = path.replace("/metabase", "");

    if (requestPath === "/dashboard") {
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
    } else if (requestPath === "/users") {
      // Fetch users data
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
    console.error("Lambda error:", error && error.stack ? error.stack : error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error:
          (error && (error.message || error.toString())) || "Unknown error",
        stack: error && error.stack,
      }),
    };
  }
};

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
