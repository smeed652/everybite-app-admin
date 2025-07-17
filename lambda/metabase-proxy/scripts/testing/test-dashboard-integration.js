#!/usr/bin/env node

/**
 * Test Dashboard GraphQL Integration
 *
 * This script tests the GraphQL query that the dashboard will use
 * to verify the integration works correctly.
 */

const { defaultClient } = require("../utils/test-helpers");

async function testDashboardIntegration() {
  console.log("🧪 Testing Dashboard GraphQL Integration");
  console.log("==========================================\n");

  try {
    // Test the quarterly metrics query that the dashboard uses
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
        `   Quarters returned: ${response.data.quarterlyMetrics.length}`
      );

      // Verify data structure
      const firstQuarter = response.data.quarterlyMetrics[0];
      if (firstQuarter) {
        console.log("\n📋 Data structure verification:");
        console.log(`  Quarter: ${firstQuarter.quarter}`);
        console.log(
          `  Orders: ${firstQuarter.orders.count} (QoQ: ${firstQuarter.orders.qoqGrowthPercent}%)`
        );
        console.log(
          `  Active SmartMenus: ${firstQuarter.activeSmartMenus.count} (QoQ: ${firstQuarter.activeSmartMenus.qoqGrowthPercent}%)`
        );
        console.log(
          `  Brands: ${firstQuarter.brands.count} (QoQ: ${firstQuarter.brands.qoqGrowthPercent}%)`
        );
        console.log(
          `  Locations: ${firstQuarter.locations.count} (QoQ: ${firstQuarter.locations.qoqGrowthPercent}%)`
        );
      }

      // Calculate totals for dashboard verification
      const totalOrders = response.data.quarterlyMetrics.reduce(
        (sum, q) => sum + (q.orders.count || 0),
        0
      );
      const totalSmartMenus = response.data.quarterlyMetrics.reduce(
        (sum, q) => sum + (q.activeSmartMenus.count || 0),
        0
      );
      const totalLocations = response.data.quarterlyMetrics.reduce(
        (sum, q) => sum + (q.locations.count || 0),
        0
      );

      console.log("\n📈 Dashboard totals:");
      console.log(`  Total Orders: ${totalOrders.toLocaleString()}`);
      console.log(`  Total SmartMenus: ${totalSmartMenus.toLocaleString()}`);
      console.log(`  Total Locations: ${totalLocations.toLocaleString()}`);

      console.log("\n✅ Dashboard integration test passed!");
      console.log(`   Total Orders: ${totalOrders.toLocaleString()}`);
      console.log(`   Total SmartMenus: ${totalSmartMenus.toLocaleString()}`);
      console.log(`   Total Locations: ${totalLocations.toLocaleString()}`);
      console.log(`   Quarters: ${response.data.quarterlyMetrics.length}`);
    } else {
      console.log("❌ Quarterly metrics query failed - no data returned");
      console.log("Response:", JSON.stringify(response, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Dashboard integration test failed");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the test
testDashboardIntegration();
