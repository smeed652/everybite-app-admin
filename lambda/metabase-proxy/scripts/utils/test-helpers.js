const GraphQLClient = require("./graphql-client");

// Configuration
const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

// Create default client
const defaultClient = new GraphQLClient(LAMBDA_URL, API_KEY);

// Test result formatters
function formatQuarterlyMetrics(data) {
  console.log("📊 Dashboard Data Summary:\n");

  data.forEach((quarter) => {
    console.log(`${quarter.quarterLabel}:`);
    console.log(
      `  Brands: ${quarter.brands.count} (${quarter.brands.qoqGrowthPercent}%)`
    );
    console.log(
      `  Locations: ${quarter.locations.count} (${quarter.locations.qoqGrowthPercent}%)`
    );
    console.log(
      `  Orders: ${quarter.orders.count.toLocaleString()} (${quarter.orders.qoqGrowthPercent}%)`
    );
    console.log(
      `  Active SmartMenus: ${quarter.activeSmartMenus.count} (${quarter.activeSmartMenus.qoqGrowthPercent}%)`
    );
    console.log("");
  });
}

function formatTableData(data, tableName) {
  console.log(`📋 ${tableName} Data:`);
  console.log(`  Total Records: ${data.length}`);
  if (data.length > 0) {
    console.log(`  Sample Record:`, JSON.stringify(data[0], null, 2));
  }
  console.log("");
}

function formatMetadata(metadata) {
  console.log("📊 Table Metadata:");
  console.log(`  Table: ${metadata.tableName}`);
  console.log(`  Row Count: ${metadata.rowCount.toLocaleString()}`);
  console.log(`  Estimated Size: ${metadata.estimatedSize}`);
  console.log(`  Last Updated: ${metadata.lastUpdated}`);
  console.log("");
}

// Test runners
async function runBasicTests() {
  console.log("🧪 Running Basic Connection Tests...\n");

  try {
    // Test connection
    console.log("1️⃣ Testing API connection...");
    const connectionResult = await defaultClient.testConnection();
    console.log("✅ Connection successful");
    console.log(
      `   Lambda Version: ${connectionResult.data.info.lambdaVersion}`
    );
    console.log(`   Environment: ${connectionResult.data.info.environment}`);
    console.log("");

    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    return false;
  }
}

async function runQuarterlyMetricsTest() {
  console.log("🧪 Testing Quarterly Metrics Dashboard...\n");

  try {
    const query = `
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
    `;

    const result = await defaultClient.query(query);
    console.log("✅ Quarterly Metrics Dashboard Response:");
    console.log(JSON.stringify(result, null, 2));
    console.log("");

    formatQuarterlyMetrics(result.data.quarterlyMetrics);
    return true;
  } catch (error) {
    console.error("❌ Quarterly metrics test failed:", error.message);
    return false;
  }
}

module.exports = {
  GraphQLClient,
  defaultClient,
  formatQuarterlyMetrics,
  formatTableData,
  formatMetadata,
  runBasicTests,
  runQuarterlyMetricsTest,
  LAMBDA_URL,
  API_KEY,
};
