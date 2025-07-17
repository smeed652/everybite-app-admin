const axios = require("axios");

// Function URL from the deployment
const FUNCTION_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";

// API Key
const API_KEY = "eb-analytics-20b3fd7316dd5c322412fd74b1afc76a";

async function testUserQuery() {
  console.log("🧪 Testing user's exact query...");

  // This is the exact query the user is sending
  const query = `
    query GetQuarterlyMetrics {
      quarterlyMetrics(startQuarter: "2024-01-01") {
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

    console.log("✅ Response status:", response.status);
    console.log("✅ Response data:", JSON.stringify(response.data, null, 2));

    if (response.data.data?.quarterlyMetrics?.length > 0) {
      console.log(
        "🎉 Success! Found",
        response.data.data.quarterlyMetrics.length,
        "quarters"
      );
    } else {
      console.log("⚠️  Query returned empty results");
    }
  } catch (error) {
    console.error("❌ Error status:", error.response?.status);
    console.error("❌ Error data:", error.response?.data);
    console.error("❌ Error message:", error.message);
  }
}

async function testCurlEquivalent() {
  console.log("\n🧪 Testing cURL equivalent...");

  const query = `
    query GetQuarterlyMetrics {
      quarterlyMetrics(startQuarter: "2024-01-01") {
        quarter
        activeSmartMenus
        totalOrders
        brands
        totalLocations
        qoqGrowth
      }
    }
  `;

  const { exec } = require("child_process");
  const curlCommand = `curl -X POST "${FUNCTION_URL}/graphql" -H "Content-Type: application/json" -H "X-API-Key: ${API_KEY}" -d '{"query":"${query.replace(/\n/g, " ").replace(/"/g, '\\"')}"}'`;

  console.log("📤 cURL command:", curlCommand);

  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ cURL error:", error);
      return;
    }
    if (stderr) {
      console.error("❌ cURL stderr:", stderr);
      return;
    }
    console.log("✅ cURL response:", stdout);
  });
}

async function runTests() {
  console.log("🚀 Testing user's exact query...\n");

  await testUserQuery();
  await testCurlEquivalent();

  console.log("\n✨ Tests completed!");
}

runTests().catch(console.error);
