const axios = require("axios");

// Metabase session management
let sessionToken = null;
let sessionExpires = null;

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

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      body: "",
    };
  }

  try {
    // Handle Lambda Function URL path format
    let path = event.path;
    if (path && path.includes("/metabase")) {
      path = path.replace("/metabase", "");
    } else if (event.rawPath) {
      path = event.rawPath.replace("/metabase", "");
    } else {
      path = "/";
    }

    if (path === "/dashboard") {
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
        body: JSON.stringify({
          totalUsers: users.data.length,
          totalDashboards: dashboards.length,
          totalQuestions: questions.length,
          activeUsers,
          popularDashboards,
        }),
      };
    } else if (path === "/users") {
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
        body: JSON.stringify({
          users: transformedUsers,
          total: users.total,
          limit: users.limit,
          offset: users.offset,
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Endpoint not found" }),
      };
    }
  } catch (error) {
    console.error("Lambda error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Metabase data",
        details: error.message,
      }),
    };
  }
};
