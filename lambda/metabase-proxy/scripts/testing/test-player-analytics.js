const axios = require("axios");
require("dotenv").config();

// Configuration
const LAMBDA_URL =
  process.env.LAMBDA_URL ||
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws/graphql";
const API_KEY = process.env.API_KEY || "3SB3ZawcNr3AT11vxKruJ";

// Test queries
const GET_PLAYER_ANALYTICS = `
  query GetPlayerAnalytics {
    db_widgetsList {
      items {
        id
        publishedAt
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled
      }
    }
  }
`;

const GET_DASHBOARD_WIDGETS = `
  query GetDashboardWidgets {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        numberOfLocations
      }
      pagination {
        total
      }
    }
  }
`;

const GET_QUARTERLY_METRICS = `
  query GetQuarterlyMetrics {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      locations {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      brands {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      totalRevenue {
        amount
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;

async function testQuery(queryName, query, variables = {}) {
  console.log(`\n🔍 Testing ${queryName}...`);
  console.log("Query:", query);

  try {
    const response = await axios.post(
      LAMBDA_URL,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      }
    );

    console.log(`✅ ${queryName} Response Status:`, response.status);

    if (response.data.errors) {
      console.error(`❌ ${queryName} GraphQL Errors:`, response.data.errors);
    }

    if (response.data.data) {
      console.log(
        `📊 ${queryName} Data Keys:`,
        Object.keys(response.data.data)
      );

      // Log specific data structure
      if (response.data.data.db_widgetsList) {
        console.log(`📋 ${queryName} db_widgetsList:`, {
          hasItems: !!response.data.data.db_widgetsList.items,
          itemsLength: response.data.data.db_widgetsList.items?.length || 0,
          firstItem: response.data.data.db_widgetsList.items?.[0] || null,
        });
      }

      if (response.data.data.quarterlyMetrics) {
        console.log(`📈 ${queryName} quarterlyMetrics:`, {
          hasData: !!response.data.data.quarterlyMetrics,
          dataLength: response.data.data.quarterlyMetrics?.length || 0,
          firstItem: response.data.data.quarterlyMetrics?.[0] || null,
        });
      }
    }

    return response.data;
  } catch (error) {
    console.error(
      `❌ ${queryName} Error:`,
      error.response?.data || error.message
    );
    return null;
  }
}

async function runTests() {
  console.log("🚀 Starting Player Analytics Tests");
  console.log("Lambda URL:", LAMBDA_URL);

  // Test 1: GetPlayerAnalytics query
  const playerAnalyticsResult = await testQuery(
    "GetPlayerAnalytics",
    GET_PLAYER_ANALYTICS
  );

  // Test 2: GetDashboardWidgets query (for comparison)
  const dashboardWidgetsResult = await testQuery(
    "GetDashboardWidgets",
    GET_DASHBOARD_WIDGETS
  );

  // Test 3: GetQuarterlyMetrics query (to see if this is what's being returned)
  const quarterlyMetricsResult = await testQuery(
    "GetQuarterlyMetrics",
    GET_QUARTERLY_METRICS
  );

  console.log("\n📋 Summary:");
  console.log(
    "GetPlayerAnalytics returns:",
    playerAnalyticsResult?.data
      ? Object.keys(playerAnalyticsResult.data)
      : "No data"
  );
  console.log(
    "GetDashboardWidgets returns:",
    dashboardWidgetsResult?.data
      ? Object.keys(dashboardWidgetsResult.data)
      : "No data"
  );
  console.log(
    "GetQuarterlyMetrics returns:",
    quarterlyMetricsResult?.data
      ? Object.keys(quarterlyMetricsResult.data)
      : "No data"
  );

  // Check if GetPlayerAnalytics is returning quarterlyMetrics data instead of db_widgetsList
  if (
    playerAnalyticsResult?.data?.quarterlyMetrics &&
    !playerAnalyticsResult?.data?.db_widgetsList
  ) {
    console.log(
      "\n⚠️  ISSUE DETECTED: GetPlayerAnalytics is returning quarterlyMetrics instead of db_widgetsList!"
    );
    console.log(
      "This explains why the frontend shows 0% - it's getting the wrong data structure."
    );
  }
}

runTests().catch(console.error);
