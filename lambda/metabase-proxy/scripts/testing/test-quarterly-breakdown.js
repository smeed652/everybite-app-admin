#!/usr/bin/env node

/**
 * Test Quarterly Breakdown - Detailed Analysis
 *
 * This script shows the full quarterly breakdown to identify issues
 * with brands calculation.
 */

const { defaultClient } = require("../utils/test-helpers");

async function testQuarterlyBreakdown() {
  console.log("🧪 Testing Quarterly Breakdown - Detailed Analysis");
  console.log("==================================================\n");

  try {
    const query = `
      query GetQuarterlyMetrics {
        quarterlyMetrics {
          quarter
          orders { count qoqGrowth qoqGrowthPercent }
          locations { count qoqGrowth qoqGrowthPercent }
          activeSmartMenus { count qoqGrowth qoqGrowthPercent }
          brands { count qoqGrowth qoqGrowthPercent }
        }
      }
    `;

    console.log("📊 Testing quarterly metrics query...");
    const response = await defaultClient.query(query);

    if (response.data?.quarterlyMetrics) {
      console.log("✅ Quarterly metrics query successful");
      console.log(
        `   Quarters returned: ${response.data.quarterlyMetrics.length}\n`
      );

      console.log("📋 Full Quarterly Breakdown:");
      console.log("=".repeat(80));

      response.data.quarterlyMetrics.forEach((quarter, index) => {
        console.log(`\n${quarter.quarter}:`);
        console.log(
          `  Orders: ${quarter.orders.count.toLocaleString()} (QoQ: ${quarter.orders.qoqGrowthPercent?.toFixed(1)}%)`
        );
        console.log(
          `  Active SmartMenus: ${quarter.activeSmartMenus.count} (QoQ: ${quarter.activeSmartMenus.qoqGrowthPercent?.toFixed(1)}%)`
        );
        console.log(
          `  Brands: ${quarter.brands.count} (QoQ: ${quarter.brands.qoqGrowthPercent?.toFixed(1)}%)`
        );
        console.log(
          `  Locations: ${quarter.locations.count.toLocaleString()} (QoQ: ${quarter.locations.qoqGrowthPercent?.toFixed(1)}%)`
        );
      });

      // Check for potential issues
      console.log("\n🔍 Analysis:");
      console.log("=".repeat(80));

      const earlyQuarters = response.data.quarterlyMetrics.filter((q) => {
        const date = new Date(q.quarter);
        return date < new Date("2024-03-27"); // Before first launch
      });

      if (earlyQuarters.length > 0) {
        console.log("⚠️  WARNING: Found data before 3/27/24 launch date:");
        earlyQuarters.forEach((q) => {
          console.log(
            `  ${q.quarter}: ${q.brands.count} brands, ${q.activeSmartMenus.count} SmartMenus`
          );
        });
      } else {
        console.log("✅ No data found before 3/27/24 launch date");
      }

      // Check for zero brands in recent quarters
      const recentQuarters = response.data.quarterlyMetrics.slice(0, 2);
      const zeroBrands = recentQuarters.filter((q) => q.brands.count === 0);

      if (zeroBrands.length > 0) {
        console.log("\n⚠️  WARNING: Found quarters with zero brands:");
        zeroBrands.forEach((q) => {
          console.log(`  ${q.quarter}: 0 brands`);
        });
      }
    } else {
      console.log("❌ Quarterly metrics query failed - no data returned");
      console.log("Response:", JSON.stringify(response, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Quarterly breakdown test failed");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the test
testQuarterlyBreakdown();
