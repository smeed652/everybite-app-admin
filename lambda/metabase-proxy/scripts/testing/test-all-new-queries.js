#!/usr/bin/env node

/**
 * Test All New Lambda GraphQL Queries
 *
 * This script tests all the new analytics queries we just implemented
 * and displays their results in a clear, formatted way.
 */

const axios = require("axios");

// Configuration
const LAMBDA_URL =
  process.env.LAMBDA_URL ||
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = process.env.API_KEY || "3SB3ZawcNr3AT11vxKruJ";

// GraphQL queries for all new analytics
const QUERIES = {
  dashboardMetrics: `
    query DashboardMetrics {
      dashboardMetrics {
        widgetSummary {
          totalWidgets
          activeWidgets
          totalLocations
          totalOrders
          averageOrdersPerWidget
        }
        quarterlyMetrics {
          quarter
          year
          quarterLabel
          brands {
            count
            qoqGrowth
            qoqGrowthPercent
          }
          locations {
            count
            qoqGrowth
            qoqGrowthPercent
          }
          orders {
            count
            qoqGrowth
            qoqGrowthPercent
          }
          activeSmartMenus {
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
        kpis {
          totalRevenue
          totalDinerVisits
          averageOrderValue
          conversionRate
        }
      }
    }
  `,

  featureAdoption: `
    query FeatureAdoption {
      featureAdoption {
        totalActive
        withImages
        withCardLayout
        withOrdering
        withByo
      }
    }
  `,

  quarterlyTrends: `
    query QuarterlyTrends {
      quarterlyTrends {
        quarter
        year
        quarterLabel
        totalOrders
        activeWidgets
        newWidgets
        newBrands
        newLocations
      }
    }
  `,

  monthlyGrowth: `
    query MonthlyGrowth {
      monthlyGrowth {
        month
        year
        monthNum
        monthLabel
        totalOrders
        activeWidgets
        newWidgets
        newBrands
      }
    }
  `,

  dailyOrdersTrends: `
    query DailyOrdersTrends {
      dailyOrdersTrends {
        day
        dayLabel
        totalOrders
        activeWidgets
        uniqueUsers
      }
    }
  `,

  activationInsights: `
    query ActivationInsights {
      activationInsights {
        activationStats {
          status
          count
          avgLocations
        }
        recentActivations {
          week
          weekLabel
          activations
        }
      }
    }
  `,

  retentionAnalytics: `
    query RetentionAnalytics {
      retentionAnalytics {
        cohortMonth
        monthLabel
        cohortSize
        firstTimeUsers
        returningUsers
        retentionRate
      }
    }
  `,
};

// Helper function to make GraphQL requests
async function executeQuery(queryName, query) {
  try {
    console.log(`\n🔍 Testing: ${queryName}`);
    console.log("=".repeat(50));

    const response = await axios.post(
      `${LAMBDA_URL}/graphql`,
      {
        query: query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        timeout: 30000,
      }
    );

    console.log(`📡 Raw Response for ${queryName}:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      console.error(`❌ Errors in ${queryName}:`, response.data.errors);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error(`❌ Error executing ${queryName}:`, error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return null;
  }
}

// Helper function to format numbers
function formatNumber(num) {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat().format(num);
}

// Helper function to format percentages
function formatPercent(num) {
  if (num === null || num === undefined) return "N/A";
  return `${num.toFixed(2)}%`;
}

// Display functions for each query type
function displayDashboardMetrics(data) {
  if (!data?.dashboardMetrics) {
    console.log("❌ No dashboard metrics data");
    return;
  }

  const { widgetSummary, quarterlyMetrics, kpis } = data.dashboardMetrics;

  console.log("\n📊 WIDGET SUMMARY:");
  console.log(`  Total Widgets: ${formatNumber(widgetSummary.totalWidgets)}`);
  console.log(`  Active Widgets: ${formatNumber(widgetSummary.activeWidgets)}`);
  console.log(
    `  Total Locations: ${formatNumber(widgetSummary.totalLocations)}`
  );
  console.log(`  Total Orders: ${formatNumber(widgetSummary.totalOrders)}`);
  console.log(
    `  Avg Orders/Widget: ${formatNumber(widgetSummary.averageOrdersPerWidget)}`
  );

  console.log("\n📈 QUARTERLY METRICS:");
  quarterlyMetrics.forEach((qm) => {
    console.log(`\n  ${qm.quarterLabel}:`);
    console.log(
      `    Brands: ${formatNumber(qm.brands.count)} (${formatPercent(qm.brands.qoqGrowthPercent)})`
    );
    console.log(
      `    Locations: ${formatNumber(qm.locations.count)} (${formatPercent(qm.locations.qoqGrowthPercent)})`
    );
    console.log(
      `    Orders: ${formatNumber(qm.orders.count)} (${formatPercent(qm.orders.qoqGrowthPercent)})`
    );
    console.log(
      `    Active SmartMenus: ${formatNumber(qm.activeSmartMenus.count)} (${formatPercent(qm.activeSmartMenus.qoqGrowthPercent)})`
    );
  });

  console.log("\n🎯 KPIs:");
  console.log(`  Total Revenue: $${formatNumber(kpis.totalRevenue)}`);
  console.log(`  Total Diner Visits: ${formatNumber(kpis.totalDinerVisits)}`);
  console.log(
    `  Average Order Value: $${formatNumber(kpis.averageOrderValue)}`
  );
  console.log(`  Conversion Rate: ${formatPercent(kpis.conversionRate)}`);
}

function displayFeatureAdoption(data) {
  if (!data?.featureAdoption) {
    console.log("❌ No feature adoption data");
    return;
  }

  const fa = data.featureAdoption;
  const total = fa.totalActive;

  console.log("\n🔧 FEATURE ADOPTION:");
  console.log(`  Total Active Widgets: ${formatNumber(total)}`);
  console.log(
    `  With Images: ${formatNumber(fa.withImages)} (${formatPercent((fa.withImages / total) * 100)})`
  );
  console.log(
    `  With Card Layout: ${formatNumber(fa.withCardLayout)} (${formatPercent((fa.withCardLayout / total) * 100)})`
  );
  console.log(
    `  With Ordering: ${formatNumber(fa.withOrdering)} (${formatPercent((fa.withOrdering / total) * 100)})`
  );
  console.log(
    `  With BYO: ${formatNumber(fa.withByo)} (${formatPercent((fa.withByo / total) * 100)})`
  );
}

function displayQuarterlyTrends(data) {
  if (!data?.quarterlyTrends) {
    console.log("❌ No quarterly trends data");
    return;
  }

  console.log("\n📈 QUARTERLY TRENDS:");
  if (Array.isArray(data.quarterlyTrends)) {
    data.quarterlyTrends.forEach((qt) => {
      console.log(`\n  ${qt.quarterLabel}:`);
      console.log(`    Total Orders: ${formatNumber(qt.totalOrders)}`);
      console.log(`    Active Widgets: ${formatNumber(qt.activeWidgets)}`);
      console.log(`    New Widgets: ${formatNumber(qt.newWidgets)}`);
      console.log(`    New Brands: ${formatNumber(qt.newBrands)}`);
      console.log(`    New Locations: ${formatNumber(qt.newLocations)}`);
    });
  } else {
    console.log("  Data is not an array:", typeof data.quarterlyTrends);
    console.log("  Raw data:", JSON.stringify(data.quarterlyTrends, null, 2));
  }
}

function displayMonthlyGrowth(data) {
  if (!data?.monthlyGrowth) {
    console.log("❌ No monthly growth data");
    return;
  }

  console.log("\n📊 MONTHLY GROWTH (Last 12 months):");
  data.monthlyGrowth.forEach((mg) => {
    console.log(`\n  ${mg.monthLabel}:`);
    console.log(`    Total Orders: ${formatNumber(mg.totalOrders)}`);
    console.log(`    Active Widgets: ${formatNumber(mg.activeWidgets)}`);
    console.log(`    New Widgets: ${formatNumber(mg.newWidgets)}`);
    console.log(`    New Brands: ${formatNumber(mg.newBrands)}`);
  });
}

function displayDailyOrdersTrends(data) {
  if (!data?.dailyOrdersTrends) {
    console.log("❌ No daily orders trends data");
    return;
  }

  console.log("\n📅 DAILY ORDERS TRENDS (Last 30 days):");
  data.dailyOrdersTrends.slice(0, 10).forEach((dot) => {
    // Show first 10 days
    console.log(
      `  ${dot.dayLabel}: ${formatNumber(dot.totalOrders)} orders, ${formatNumber(dot.activeWidgets)} widgets, ${formatNumber(dot.uniqueUsers)} users`
    );
  });
  if (data.dailyOrdersTrends.length > 10) {
    console.log(`  ... and ${data.dailyOrdersTrends.length - 10} more days`);
  }
}

function displayActivationInsights(data) {
  if (!data?.activationInsights) {
    console.log("❌ No activation insights data");
    return;
  }

  const { activationStats, recentActivations } = data.activationInsights;

  console.log("\n🚀 ACTIVATION INSIGHTS:");
  console.log("\n  Activation Stats:");
  activationStats.forEach((as) => {
    console.log(
      `    ${as.status}: ${formatNumber(as.count)} widgets (avg ${formatNumber(as.avgLocations)} locations)`
    );
  });

  console.log("\n  Recent Activations (Last 8 weeks):");
  recentActivations.forEach((ra) => {
    console.log(
      `    ${ra.weekLabel}: ${formatNumber(ra.activations)} activations`
    );
  });
}

function displayRetentionAnalytics(data) {
  if (!data?.retentionAnalytics) {
    console.log("❌ No retention analytics data");
    return;
  }

  console.log("\n🔄 RETENTION ANALYTICS:");
  data.retentionAnalytics.forEach((ra) => {
    console.log(`\n  ${ra.monthLabel}:`);
    console.log(`    Cohort Size: ${formatNumber(ra.cohortSize)}`);
    console.log(`    First Time Users: ${formatNumber(ra.firstTimeUsers)}`);
    console.log(`    Returning Users: ${formatNumber(ra.returningUsers)}`);
    console.log(`    Retention Rate: ${formatPercent(ra.retentionRate)}`);
  });
}

// Main execution function
async function runAllTests() {
  console.log("🧪 Testing All New Lambda GraphQL Queries");
  console.log("==========================================");
  console.log(`Lambda URL: ${LAMBDA_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);

  const results = {};

  // Execute all queries
  for (const [queryName, query] of Object.entries(QUERIES)) {
    const result = await executeQuery(queryName, query);
    results[queryName] = result;
  }

  // Display results
  console.log("\n\n📋 QUERY RESULTS SUMMARY");
  console.log("========================");

  if (results.dashboardMetrics) {
    displayDashboardMetrics(results);
  }

  if (results.featureAdoption) {
    displayFeatureAdoption(results);
  }

  if (results.quarterlyTrends) {
    displayQuarterlyTrends(results);
  }

  if (results.monthlyGrowth) {
    displayMonthlyGrowth(results);
  }

  if (results.dailyOrdersTrends) {
    displayDailyOrdersTrends(results);
  }

  if (results.activationInsights) {
    displayActivationInsights(results);
  }

  if (results.retentionAnalytics) {
    displayRetentionAnalytics(results);
  }

  // Summary
  console.log("\n\n✅ TEST SUMMARY");
  console.log("===============");
  const successfulQueries = Object.keys(results).filter(
    (key) => results[key] !== null
  );
  const failedQueries = Object.keys(results).filter(
    (key) => results[key] === null
  );

  console.log(
    `✅ Successful Queries: ${successfulQueries.length}/${Object.keys(QUERIES).length}`
  );
  successfulQueries.forEach((q) => console.log(`   - ${q}`));

  if (failedQueries.length > 0) {
    console.log(`❌ Failed Queries: ${failedQueries.length}`);
    failedQueries.forEach((q) => console.log(`   - ${q}`));
  }

  console.log("\n🎉 All tests completed!");
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, QUERIES };
