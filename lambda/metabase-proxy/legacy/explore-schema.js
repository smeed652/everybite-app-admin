const axios = require("axios");

// Configuration
const LAMBDA_URL = process.env.LAMBDA_URL || "https://your-lambda-url-here";
const API_KEY = process.env.API_KEY || "your-api-key-here";

async function exploreSchema() {
  const query = `
    query ExploreSchema {
      schemaExploration {
        tables {
          tableName
        }
        widgetInteractionsColumns {
          columnName
          dataType
          comment
        }
        dbWidgetsColumns {
          columnName
          dataType
          comment
        }
        widgetInteractionsSample {
          values
        }
        dbWidgetsSample {
          values
        }
      }
    }
  `;

  const payload = {
    query,
  };

  try {
    console.log("🔍 Exploring Athena schema...");
    console.log("🌐 Lambda URL:", LAMBDA_URL);

    const response = await axios.post(`${LAMBDA_URL}/graphql`, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      timeout: 30000,
    });

    console.log("✅ Response status:", response.status);

    if (response.data.data?.schemaExploration) {
      const schema = response.data.data.schemaExploration;

      console.log("\n📊 ATHENA SCHEMA EXPLORATION RESULTS");
      console.log("=".repeat(50));

      // Show available tables
      console.log("\n📋 AVAILABLE TABLES:");
      console.log("-".repeat(30));
      schema.tables.forEach((table) => {
        console.log(`• ${table.tableName}`);
      });

      // Show widget_interactions columns
      console.log("\n🔧 WIDGET_INTERACTIONS TABLE COLUMNS:");
      console.log("-".repeat(40));
      schema.widgetInteractionsColumns.forEach((column) => {
        const comment = column.comment ? ` (${column.comment})` : "";
        console.log(`• ${column.columnName}: ${column.dataType}${comment}`);
      });

      // Show db_widgets columns
      console.log("\n🏪 DB_WIDGETS TABLE COLUMNS:");
      console.log("-".repeat(35));
      schema.dbWidgetsColumns.forEach((column) => {
        const comment = column.comment ? ` (${column.comment})` : "";
        console.log(`• ${column.columnName}: ${column.dataType}${comment}`);
      });

      // Show sample data
      if (schema.widgetInteractionsSample.length > 0) {
        console.log("\n📈 WIDGET_INTERACTIONS SAMPLE DATA:");
        console.log("-".repeat(40));
        schema.widgetInteractionsSample.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row.values.join(" | "));
        });
      }

      if (schema.dbWidgetsSample.length > 0) {
        console.log("\n🏪 DB_WIDGETS SAMPLE DATA:");
        console.log("-".repeat(30));
        schema.dbWidgetsSample.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row.values.join(" | "));
        });
      }

      console.log("\n✅ Schema exploration completed!");
      console.log("\n💡 TIPS:");
      console.log("• Use these column names when creating new queries");
      console.log("• Check data types to ensure proper filtering");
      console.log("• Sample data shows the actual data format");
    } else if (response.data.errors) {
      console.log(
        "❌ GraphQL errors:",
        JSON.stringify(response.data.errors, null, 2)
      );
    } else {
      console.log("❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Schema exploration failed:", error.message);
    if (error.response) {
      console.error(
        "📊 Error response:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
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

exploreSchema();
