const axios = require("axios");

// Configuration
const config = {
  apiKey: process.env.API_KEY || "3SB3ZawcNr3AT11vxKruJ",
  lambdaUrl:
    process.env.LAMBDA_URL ||
    "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws",
};

// Helper function to make authenticated requests to Lambda
async function makeLambdaRequest(query, options = {}) {
  try {
    const response = await axios({
      method: "POST",
      url: `${config.lambdaUrl}/graphql`,
      headers: {
        "X-API-Key": config.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
      data: { query },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error making request:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// Get database schema via Lambda
async function getDatabaseSchema() {
  console.log("🔍 Fetching database schema via Lambda...");
  try {
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

    const result = await makeLambdaRequest(query);
    console.log("🔎 Raw Lambda response:", JSON.stringify(result, null, 2));
    console.log("✅ Database schema retrieved successfully");
    return result.data?.schemaExploration;
  } catch (error) {
    console.error("❌ Failed to get database schema:", error.message);
    throw error;
  }
}

// Get sample data from a specific table
async function getSampleData(tableName, limit = 10) {
  console.log(`📋 Fetching sample data from table ${tableName}...`);

  try {
    const query = `
      query GetSampleData($tableName: String!, $limit: Int!) {
        sampleData(tableName: $tableName, limit: $limit) {
          columns
          rows
        }
      }
    `;

    const result = await makeLambdaRequest(query, {
      variables: { tableName, limit },
    });

    console.log(
      `✅ Sample data from table ${tableName} retrieved successfully`
    );
    return result.data?.sampleData;
  } catch (error) {
    console.error(
      `❌ Failed to get sample data from table ${tableName}:`,
      error.message
    );
    throw error;
  }
}

// Get detailed metadata for any table
async function getTableMetadata(tableName) {
  console.log(`📊 Fetching detailed metadata for table ${tableName}...`);

  try {
    const query = `
      query GetTableMetadata($tableName: String!) {
        tableMetadata(tableName: $tableName) {
          columns {
            name
            dataType
            isNullable
            comment
            isPrimaryKey
            isForeignKey
          }
          rowCount
          relationships {
            targetTable
            foreignKeyColumn
            primaryKeyColumn
          }
        }
      }
    `;

    const result = await makeLambdaRequest(query, {
      variables: { tableName },
    });

    console.log(`✅ Table metadata for ${tableName} retrieved successfully`);
    return result.data?.tableMetadata;
  } catch (error) {
    console.error(
      `❌ Failed to get table metadata for ${tableName}:`,
      error.message
    );
    return null;
  }
}

// Get data volume for a table
async function getDataVolume(tableName) {
  console.log(`📊 Fetching data volume for table ${tableName}...`);

  try {
    const query = `
      query GetDataVolume($tableName: String!) {
        dataVolume(tableName: $tableName) {
          rowCount
          estimatedSize
          lastUpdated
        }
      }
    `;

    const result = await makeLambdaRequest(query, {
      variables: { tableName },
    });

    console.log(`✅ Data volume for ${tableName} retrieved successfully`);
    return result.data?.dataVolume;
  } catch (error) {
    console.error(
      `❌ Failed to get data volume for ${tableName}:`,
      error.message
    );
    return null;
  }
}

// Get table relationships
async function getTableRelationships(tableName) {
  console.log(`🔗 Fetching relationships for table ${tableName}...`);

  try {
    const query = `
      query GetTableRelationships($tableName: String!) {
        tableRelationships(tableName: $tableName) {
          foreignKeys {
            columnName
            targetTable
            targetColumn
            relationshipType
          }
          referencedBy {
            sourceTable
            sourceColumn
            relationshipType
          }
        }
      }
    `;

    const result = await makeLambdaRequest(query, {
      variables: { tableName },
    });

    console.log(`✅ Relationships for ${tableName} retrieved successfully`);
    return result.data?.tableRelationships;
  } catch (error) {
    console.error(
      `❌ Failed to get relationships for ${tableName}:`,
      error.message
    );
    return null;
  }
}

// Main exploration function
async function exploreSchema() {
  console.log("🚀 Starting Lambda-based schema exploration...");
  console.log(`📍 Lambda URL: ${config.lambdaUrl}`);

  if (!config.apiKey) {
    console.error("❌ API_KEY environment variable is required");
    process.exit(1);
  }

  try {
    // Get database schema
    const schema = await getDatabaseSchema();

    // Debug: print the raw schema result
    console.log("🔎 Raw schema type:", typeof schema);
    console.log("🔎 Raw schema:", schema);
    if (schema && typeof schema === "object") {
      const schemaStr = JSON.stringify(schema);
      if (schemaStr.length > 500) {
        console.log(
          "🔎 Raw schema (first 500 chars):",
          schemaStr.slice(0, 500) + "..."
        );
      } else {
        console.log("🔎 Raw schema:", schemaStr);
      }
    }

    if (!schema) {
      console.log("❌ No schema data returned");
      return;
    }

    // Enhanced schema exploration with additional metadata
    const enhancedSchema = {
      ...schema,
      detailedMetadata: {},
      dataVolumes: {},
      relationships: {},
      explorationDate: new Date().toISOString(),
    };

    // Get detailed metadata for key tables (limit to first 10 to avoid overwhelming)
    const keyTables = schema.tables.slice(0, 10).map((t) => t.tableName);
    console.log(
      `\n🔍 Getting detailed metadata for ${keyTables.length} key tables...`
    );

    for (const tableName of keyTables) {
      console.log(`\n📊 Analyzing ${tableName}...`);

      // Get detailed metadata
      const metadata = await getTableMetadata(tableName);
      if (metadata) {
        enhancedSchema.detailedMetadata[tableName] = metadata;
      }

      // Get data volume
      const volume = await getDataVolume(tableName);
      if (volume) {
        enhancedSchema.dataVolumes[tableName] = volume;
      }

      // Get relationships
      const relationships = await getTableRelationships(tableName);
      if (relationships) {
        enhancedSchema.relationships[tableName] = relationships;
      }
    }

    // Write enhanced results to a JSON file
    const fs = require("fs");
    fs.writeFileSync(
      "enhanced-schema-results.json",
      JSON.stringify(enhancedSchema, null, 2)
    );
    console.log("✅ Enhanced results written to enhanced-schema-results.json");

    console.log("\n📋 DATABASE SCHEMA EXPLORATION RESULTS");
    console.log("=".repeat(50)); // Show available tables
    if (schema.tables && schema.tables.length > 0) {
      console.log("\n📊 AVAILABLE TABLES:");
      console.log("-".repeat(30));
      schema.tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.tableName}`);
      });
    }

    // Show widget_interactions columns
    if (
      schema.widgetInteractionsColumns &&
      schema.widgetInteractionsColumns.length > 0
    ) {
      console.log("\n🔧 WIDGET_INTERACTIONS TABLE COLUMNS:");
      console.log("-".repeat(40));
      schema.widgetInteractionsColumns.forEach((column) => {
        const comment = column.comment ? ` (${column.comment})` : "";
        console.log(`• ${column.columnName}: ${column.dataType}${comment}`);
      });
    }

    // Show db_widgets columns
    if (schema.dbWidgetsColumns && schema.dbWidgetsColumns.length > 0) {
      console.log("\n🏪 DB_WIDGETS TABLE COLUMNS:");
      console.log("-".repeat(35));
      schema.dbWidgetsColumns.forEach((column) => {
        const comment = column.comment ? ` (${column.comment})` : "";
        console.log(`• ${column.columnName}: ${column.dataType}${comment}`);
      });
    }

    // Show sample data
    if (
      schema.widgetInteractionsSample &&
      schema.widgetInteractionsSample.length > 0
    ) {
      console.log("\n📈 WIDGET_INTERACTIONS SAMPLE DATA:");
      console.log("-".repeat(40));
      schema.widgetInteractionsSample.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row.values.join(" | "));
      });
    }

    if (schema.dbWidgetsSample && schema.dbWidgetsSample.length > 0) {
      console.log("\n🏪 DB_WIDGETS SAMPLE DATA:");
      console.log("-".repeat(30));
      schema.dbWidgetsSample.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row.values.join(" | "));
      });
    }

    console.log("\n✅ Schema exploration completed successfully!");
    console.log("\n💡 TIPS:");
    console.log("• Use these column names when creating new queries");
    console.log("• Check data types to ensure proper filtering");
    console.log("• Sample data shows the actual data format");
  } catch (error) {
    console.error("❌ Schema exploration failed:", error.message);
    process.exit(1);
  }
}

// Run the exploration
if (require.main === module) {
  exploreSchema().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  exploreSchema,
  getDatabaseSchema,
  getSampleData,
  getTableMetadata,
  getDataVolume,
  getTableRelationships,
  makeLambdaRequest,
};
