const axios = require("axios");

// Configuration
const LAMBDA_URL = process.env.LAMBDA_URL || "https://your-lambda-url-here";
const API_KEY = process.env.API_KEY || "your-api-key-here";

async function testTotalMetrics() {
  const query = `
    query TestTotalMetrics($startDate: String!, $endDate: String!) {
      totalMetrics(startDate: $startDate, endDate: $endDate) {
        totalOrders
        totalDinerVisits
        startDate
        endDate
      }
    }
  `;

  const variables = {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  };

  const payload = {
    query,
    variables,
  };

  try {
    console.log("🧪 Testing totalMetrics query against Lambda...");
    console.log("📋 Query:", query);
    console.log("🔧 Variables:", JSON.stringify(variables, null, 2));
    console.log("🌐 Lambda URL:", LAMBDA_URL);

    const response = await axios.post(`${LAMBDA_URL}/graphql`, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      timeout: 30000,
    });

    console.log("✅ Response status:", response.status);
    console.log("📊 Response data:", JSON.stringify(response.data, null, 2));

    if (response.data.data?.totalMetrics) {
      const result = response.data.data.totalMetrics;
      console.log("🎉 Test passed! TotalMetrics query is working correctly.");
      console.log("📈 Total Orders:", result.totalOrders);
      console.log("👥 Total Diner Visits:", result.totalDinerVisits);
      console.log("📅 Date Range:", `${result.startDate} to ${result.endDate}`);
    } else if (response.data.errors) {
      console.log(
        "❌ GraphQL errors:",
        JSON.stringify(response.data.errors, null, 2)
      );
    } else {
      console.log("❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    if (error.response) {
      console.error(
        "📊 Error response:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

// Test with different date ranges
async function testMultipleDateRanges() {
  const testCases = [
    {
      name: "Full Year 2024",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      name: "Q1 2024",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
    },
    {
      name: "Last 30 Days",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📅 Date Range: ${testCase.startDate} to ${testCase.endDate}`);

    const query = `
      query TestTotalMetrics($startDate: String!, $endDate: String!) {
        totalMetrics(startDate: $startDate, endDate: $endDate) {
          totalOrders
          totalDinerVisits
          startDate
          endDate
        }
      }
    `;

    const variables = {
      startDate: testCase.startDate,
      endDate: testCase.endDate,
    };

    const payload = {
      query,
      variables,
    };

    try {
      const response = await axios.post(`${LAMBDA_URL}/graphql`, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        timeout: 30000,
      });

      if (response.data.data?.totalMetrics) {
        const result = response.data.data.totalMetrics;
        console.log(`✅ ${testCase.name}:`);
        console.log(`   📈 Total Orders: ${result.totalOrders}`);
        console.log(`   👥 Total Diner Visits: ${result.totalDinerVisits}`);
      } else if (response.data.errors) {
        console.log(
          `❌ ${testCase.name} - GraphQL errors:`,
          JSON.stringify(response.data.errors, null, 2)
        );
      }
    } catch (error) {
      console.error(`❌ ${testCase.name} - Error:`, error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting totalMetrics query tests...\n");

  await testTotalMetrics();
  console.log("\n" + "=".repeat(50) + "\n");
  await testMultipleDateRanges();

  console.log("\n✅ All tests completed!");
}

// Check if required environment variables are set
if (!LAMBDA_URL || LAMBDA_URL === "https://your-lambda-url-here") {
  console.error("❌ Please set LAMBDA_URL environment variable");
  console.log('Example: export LAMBDA_URL="https://your-lambda-function-url"');
  process.exit(1);
}

if (!API_KEY || API_KEY === "your-api-key-here") {
  console.error("❌ Please set API_KEY environment variable");
  console.log('Example: export API_KEY="your-api-key"');
  process.exit(1);
}

runTests();
