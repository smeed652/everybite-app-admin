const axios = require("axios");

// Function URL from the deployment
const FUNCTION_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";

// Test JWT token (you'll need to get a fresh one)
const JWT_TOKEN =
  "eyJraWQiOiJ5SjFnUEVuck9Cd3cwdktGZytRMFRISmlaM2ZYK0xvYmMwQWFSY0g4bUFJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlOTk5NTk4ZS02MGIxLTcwNTItZGJkNS0zMTQ2NzQ3ZTdiMGIiLCJjb2duaXRvOmdyb3VwcyI6WyJBRE1JTiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0xLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMV9IdVZ3eXdtSDEiLCJjb2duaXRvOnVzZXJuYW1lIjoiZTk5OTU5OGUtNjBiMS03MDUyLWRiZDUtMzE0Njc0N2U3YjBiIiwib3JpZ2luX2p0aSI6IjQ2MTdjZTg4LTE5MzEtNDVjYy05MThlLTUzMTcxMzMzOThhZiIsImF1ZCI6Ijc0NmQ3YzZpdHV1NG41NzJoZWYxMDBtNXM3IiwiZXZlbnRfaWQiOiJlZGViZDZlMS1mNzM5LTQ2ZWYtOWQ5ZS01NDZkN2YzYWIxMzciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc1MjcwMDEyMywiZXhwIjoxNzUyNzAzNzIzLCJpYXQiOjE3NTI3MDAxMjMsImp0aSI6Ijg4OTRiNTBlLWQzNDYtNDhkYy04YTg3LTYxNWM2YjJlZmJlZiIsImVtYWlsIjoiY3lwcmVzcy10ZXN0QGV4YW1wbGUuY29tIn0.L3AyFiQQqx83PbGjpafkd8H1owfJ1o5lwJW8yoCF2qwFClHEOK71Laep-KIw1v82UxnAFhS1_8HhYz0JF8AlSfqeWNPSt77pjAmshItteetgwXluSvpl5rknE2CfOkpcrgaRTJHT-Au36z-jfXa7H7NUta7D--7P6EF01tW2kHkkAHq1lxP7eDY9aibl6h90eUuO9Xhd0LYe3ZQC2wu3fyMnH0uTdsP3XCdGLCw8gu0wmhssKRpjY_TEy6iQ1KS3pRXlxwnZ0kfo2r8H6Ytko--06r3NRVecZRyMaUMDgmKKMHwivsuaMR5yCB4-AQHypJ2C7XIeo9DrvLxSw7WZ4Q";

async function testQuarterlyMetrics() {
  console.log("🧪 Testing quarterlyMetrics query...");

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
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
      }
    );

    console.log(
      "✅ quarterlyMetrics response:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data.data?.quarterlyMetrics?.length > 0) {
      console.log(
        "🎉 quarterlyMetrics query is working! Found",
        response.data.data.quarterlyMetrics.length,
        "quarters"
      );
    } else {
      console.log("⚠️  quarterlyMetrics query returned empty results");
    }
  } catch (error) {
    console.error(
      "❌ quarterlyMetrics error:",
      error.response?.data || error.message
    );
  }
}

async function testDailyOrders() {
  console.log("\n🧪 Testing dailyOrders query...");

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
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
      }
    );

    console.log(
      "✅ dailyOrders response:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data.data?.dailyOrders?.length > 0) {
      console.log(
        "🎉 dailyOrders query is working! Found",
        response.data.data.dailyOrders.length,
        "days"
      );
    } else {
      console.log("⚠️  dailyOrders query returned empty results");
    }
  } catch (error) {
    console.error(
      "❌ dailyOrders error:",
      error.response?.data || error.message
    );
  }
}

async function runTests() {
  console.log("🚀 Starting GraphQL query tests...\n");

  await testQuarterlyMetrics();
  await testDailyOrders();

  console.log("\n✨ Tests completed!");
}

runTests().catch(console.error);
