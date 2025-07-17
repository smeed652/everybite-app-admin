const axios = require("axios");

const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

async function testQuarterlyMetricsDashboard() {
  console.log("🧪 Testing Quarterly Metrics Dashboard GraphQL Query...\n");

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  try {
    const query = {
      query: `
        query GetQuarterlyMetricsDashboard {
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
        }
      `,
    };

    const response = await axios.post(`${LAMBDA_URL}/graphql`, query, {
      headers,
    });

    console.log("✅ Quarterly Metrics Dashboard Response:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.data?.quarterlyMetrics?.length > 0) {
      console.log("\n📊 Dashboard Data Summary:");
      const metrics = response.data.data.quarterlyMetrics;

      metrics.forEach((metric) => {
        console.log(`\n${metric.quarterLabel}:`);
        console.log(
          `  Brands: ${metric.brands.count} (${metric.brands.qoqGrowthPercent}%)`
        );
        console.log(
          `  Locations: ${metric.locations.count.toLocaleString()} (${metric.locations.qoqGrowthPercent}%)`
        );
        console.log(
          `  Orders: ${metric.orders.count?.toLocaleString() || "N/A"} (${metric.orders.qoqGrowthPercent || "N/A"}%)`
        );
        console.log(
          `  Active SmartMenus: ${metric.activeSmartMenus.count} (${metric.activeSmartMenus.qoqGrowthPercent}%)`
        );
      });
    }
  } catch (error) {
    console.error("❌ Quarterly Metrics Dashboard Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
  }
}

testQuarterlyMetricsDashboard();
