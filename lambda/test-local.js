// Test script for Lambda function
const { handler } = require("./metabase-proxy/index.js");

// Mock event for testing
const testEvent = {
  httpMethod: "GET",
  path: "/metabase/dashboard",
  headers: {
    "Content-Type": "application/json",
  },
};

// Test the handler
async function testHandler() {
  console.log("Testing Lambda function...");

  try {
    const result = await handler(testEvent);
    console.log("✅ Success!");
    console.log("Status Code:", result.statusCode);
    console.log("Headers:", result.headers);
    console.log("Body:", JSON.parse(result.body));
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run test
testHandler();
