const axios = require("axios");

// Configuration
const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = "eb_lambda_analytics_2024";

// Test queries
const testQueries = [
  {
    name: "Widget Analytics",
    query: `
      query {
        widgetAnalytics {
          totalWidgets
          activeWidgets
          totalBrands
          totalLocations
        }
      }
    `,
  },
  {
    name: "Quarterly Metrics",
    query: `
      query {
        quarterlyMetrics {
          quarter
          orders
          brands
          locations
          activeSmartMenus
        }
      }
    `,
  },
];

async function testGraphQLEndpoint() {
  console.log("🔐 Testing Secured GraphQL Endpoint");
  console.log("=====================================\n");

  for (const testQuery of testQueries) {
    console.log(`📊 Testing: ${testQuery.name}`);

    try {
      const response = await axios.post(
        `${LAMBDA_URL}/graphql`,
        {
          query: testQuery.query,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `ApiKey ${API_KEY}`,
          },
          timeout: 30000,
        }
      );

      console.log("✅ Success!");
      console.log("Response:", JSON.stringify(response.data, null, 2));
      console.log("");
    } catch (error) {
      console.log("❌ Error:");
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.log("Error:", error.message);
      }
      console.log("");
    }
  }
}

async function testUnauthorizedAccess() {
  console.log("🚫 Testing Unauthorized Access");
  console.log("===============================\n");

  try {
    const response = await axios.post(
      `${LAMBDA_URL}/graphql`,
      {
        query: "{ widgetAnalytics { totalWidgets } }",
      },
      {
        headers: {
          "Content-Type": "application/json",
          // No Authorization header
        },
        timeout: 30000,
      }
    );

    console.log("❌ Should have failed but succeeded!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("✅ Correctly rejected unauthorized request");
      console.log("Status:", error.response.status);
      console.log("Error:", error.response.data.error);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }
}

async function testInvalidApiKey() {
  console.log("🔑 Testing Invalid API Key");
  console.log("===========================\n");

  try {
    const response = await axios.post(
      `${LAMBDA_URL}/graphql`,
      {
        query: "{ widgetAnalytics { totalWidgets } }",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "ApiKey invalid_key_123",
        },
        timeout: 30000,
      }
    );

    console.log("❌ Should have failed but succeeded!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("✅ Correctly rejected invalid API key");
      console.log("Status:", error.response.status);
      console.log("Error:", error.response.data.error);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }
}

async function runAllTests() {
  await testGraphQLEndpoint();
  await testUnauthorizedAccess();
  await testInvalidApiKey();

  console.log("🎉 All tests completed!");
}

runAllTests().catch(console.error);
