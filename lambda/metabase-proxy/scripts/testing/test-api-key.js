const axios = require("axios");

// Function URL from the deployment
const FUNCTION_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";

// API Key (from Lambda environment)
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

async function testWithApiKey() {
  console.log("🧪 Testing with API Key authentication...");

  const query = `
    query GetQuarterlyMetrics {
      quarterlyMetrics {
        quarter
        activeSmartMenus
        totalOrders
        brands
        totalLocations
        qoqGrowth
      }
    }
  `;

  try {
    const response = await axios.post(
      `${FUNCTION_URL}/graphql`,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
      }
    );

    console.log("✅ API Key response:", JSON.stringify(response.data, null, 2));

    if (response.data.data?.quarterlyMetrics?.length > 0) {
      console.log(
        "🎉 API Key authentication working! Found",
        response.data.data.quarterlyMetrics.length,
        "quarters"
      );
    } else {
      console.log("⚠️  Query returned empty results");
    }
  } catch (error) {
    console.error("❌ API Key error:", error.response?.data || error.message);
  }
}

async function testDailyOrdersWithApiKey() {
  console.log("\n🧪 Testing dailyOrders with API Key...");

  const query = `
    query GetDailyOrders {
      dailyOrders(startDate: "2024-01-01", endDate: "2025-01-01") {
        date
        count
      }
    }
  `;

  try {
    const response = await axios.post(
      `${FUNCTION_URL}/graphql`,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
      }
    );

    console.log(
      "✅ DailyOrders API Key response:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data.data?.dailyOrders?.length > 0) {
      console.log(
        "🎉 DailyOrders with API Key working! Found",
        response.data.data.dailyOrders.length,
        "days"
      );
    } else {
      console.log("⚠️  DailyOrders returned empty results");
    }
  } catch (error) {
    console.error(
      "❌ DailyOrders API Key error:",
      error.response?.data || error.message
    );
  }
}

async function runApiKeyTests() {
  console.log("🚀 Starting API Key authentication tests...\n");

  await testWithApiKey();
  await testDailyOrdersWithApiKey();

  console.log("\n✨ API Key tests completed!");
  console.log("\n📝 To use API Key authentication:");
  console.log("1. API Key is already set in Lambda environment");
  console.log("2. Use X-API-Key header instead of Authorization header");
  console.log("3. No token expiration issues!");
}

runApiKeyTests().catch(console.error);
