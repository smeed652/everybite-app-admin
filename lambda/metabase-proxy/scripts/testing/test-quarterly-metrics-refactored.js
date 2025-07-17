const { runQuarterlyMetricsTest } = require("../utils/test-helpers");

async function main() {
  console.log(
    "🧪 EveryBite SmartMenu Analytics - Quarterly Metrics Test (Refactored)"
  );
  console.log(
    "=====================================================================\n"
  );

  try {
    const success = await runQuarterlyMetricsTest();

    if (success) {
      console.log("✅ All quarterly metrics tests passed!");
    } else {
      console.log("❌ Some tests failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Test execution failed:", error.message);
    process.exit(1);
  }
}

// Run the test
main();
