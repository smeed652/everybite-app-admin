const axios = require("axios");
const fs = require("fs");

// Configuration
const config = {
  apiKey: process.env.METABASE_API_KEY,
  baseUrl: process.env.METABASE_BASE_URL || "https://metabase.everybite.com",
  databaseId: process.env.METABASE_DATABASE_ID || 1,
};

// Helper function to make authenticated requests
async function makeMetabaseRequest(endpoint, options = {}) {
  try {
    const response = await axios({
      method: options.method || "GET",
      url: `${config.baseUrl}/api${endpoint}`,
      headers: {
        "X-Metabase-Session": config.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
      data: options.data,
      params: options.params,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error making request to ${endpoint}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// Get database schema
async function getDatabaseSchema() {
  console.log("🔍 Fetching database schema...");
  try {
    const schema = await makeMetabaseRequest(
      `/database/${config.databaseId}/schema`
    );
    console.log("✅ Database schema retrieved successfully");
    return schema;
  } catch (error) {
    console.error("❌ Failed to get database schema:", error.message);
    throw error;
  }
}

// Get detailed table metadata
async function getTableMetadata(tableId) {
  console.log(`📊 Fetching detailed metadata for table ${tableId}...`);

  try {
    const metadata = await makeMetabaseRequest(
      `/table/${tableId}/query_metadata`
    );
    console.log(`✅ Table ${tableId} metadata retrieved successfully`);
    return metadata;
  } catch (error) {
    console.error(`❌ Failed to get table ${tableId} metadata:`, error.message);
    throw error;
  }
}

// Get sample data from a table
async function getSampleData(tableId, limit = 10) {
  console.log(`📋 Fetching sample data from table ${tableId}...`);

  try {
    const query = {
      type: "query",
      query: {
        "source-table": tableId,
        limit: limit,
      },
      database: parseInt(config.databaseId),
    };

    const data = await makeMetabaseRequest("/dataset", {
      method: "POST",
      data: query,
    });

    console.log(`✅ Sample data from table ${tableId} retrieved successfully`);
    return data;
  } catch (error) {
    console.error(
      `❌ Failed to get sample data from table ${tableId}:`,
      error.message
    );
    throw error;
  }
}

// Get column statistics and data analysis
async function getColumnStatistics(tableId, columnName) {
  console.log(
    `📈 Fetching statistics for column ${columnName} in table ${tableId}...`
  );

  try {
    // Query to get column statistics
    const query = {
      type: "query",
      query: {
        "source-table": tableId,
        aggregation: [
          ["count"],
          ["distinct", ["field", columnName, null]],
          ["count-where", ["is-null", ["field", columnName, null]]],
        ],
        fields: [["field", columnName, null]],
        limit: 1000, // Get more data for analysis
      },
      database: parseInt(config.databaseId),
    };

    const data = await makeMetabaseRequest("/dataset", {
      method: "POST",
      data: query,
    });

    console.log(
      `✅ Column statistics for ${columnName} retrieved successfully`
    );
    return data;
  } catch (error) {
    console.error(
      `❌ Failed to get column statistics for ${columnName}:`,
      error.message
    );
    return null;
  }
}

// Get table relationships (foreign keys)
async function getTableRelationships(tableId) {
  console.log(`🔗 Fetching relationships for table ${tableId}...`);

  try {
    // This would require Metabase's relationship API or we can infer from column names
    // For now, we'll look for common foreign key patterns
    const metadata = await getTableMetadata(tableId);
    const relationships = [];

    if (metadata.fields) {
      metadata.fields.forEach((field) => {
        // Look for common foreign key patterns
        if (
          field.name.toLowerCase().includes("id") &&
          field.name.toLowerCase() !== "id" &&
          field.base_type === "type/Integer"
        ) {
          relationships.push({
            column: field.name,
            type: "foreign_key",
            target_table: field.name.replace(/_id$/, "").replace(/id$/, ""),
            inferred: true,
          });
        }
      });
    }

    console.log(`✅ Relationships for table ${tableId} analyzed`);
    return relationships;
  } catch (error) {
    console.error(
      `❌ Failed to get relationships for table ${tableId}:`,
      error.message
    );
    return [];
  }
}

// Get data volume estimates
async function getDataVolume(tableId) {
  console.log(`📊 Fetching data volume for table ${tableId}...`);

  try {
    const query = {
      type: "query",
      query: {
        "source-table": tableId,
        aggregation: [["count"]],
      },
      database: parseInt(config.databaseId),
    };

    const data = await makeMetabaseRequest("/dataset", {
      method: "POST",
      data: query,
    });

    const count = data.data?.rows?.[0]?.[0] || 0;
    console.log(`✅ Data volume for table ${tableId}: ${count} rows`);
    return count;
  } catch (error) {
    console.error(
      `❌ Failed to get data volume for table ${tableId}:`,
      error.message
    );
    return 0;
  }
}

// Analyze data patterns and suggest GraphQL types
function analyzeDataPatterns(sampleData, columns) {
  const patterns = {
    dateColumns: [],
    numericColumns: [],
    textColumns: [],
    booleanColumns: [],
    jsonColumns: [],
    enumCandidates: [],
  };

  if (!sampleData.data?.rows || sampleData.data.rows.length === 0) {
    return patterns;
  }

  const rows = sampleData.data.rows;
  const columnNames = sampleData.data.cols?.map((col) => col.name) || [];

  columnNames.forEach((columnName, index) => {
    const values = rows.map((row) => row[index]).filter((val) => val !== null);

    if (values.length === 0) return;

    // Check for date patterns
    const datePattern = /^\d{4}-\d{2}-\d{2}/;
    if (values.some((val) => datePattern.test(val))) {
      patterns.dateColumns.push(columnName);
    }

    // Check for numeric patterns
    if (values.every((val) => !isNaN(val) && typeof val === "number")) {
      patterns.numericColumns.push(columnName);
    }

    // Check for boolean patterns
    if (
      values.every(
        (val) => val === true || val === false || val === 0 || val === 1
      )
    ) {
      patterns.booleanColumns.push(columnName);
    }

    // Check for JSON patterns
    if (
      values.some(
        (val) =>
          typeof val === "object" ||
          (typeof val === "string" &&
            (val.startsWith("{") || val.startsWith("[")))
      )
    ) {
      patterns.jsonColumns.push(columnName);
    }

    // Check for enum candidates (limited unique values)
    const uniqueValues = new Set(values);
    if (uniqueValues.size <= 10 && uniqueValues.size > 1) {
      patterns.enumCandidates.push({
        column: columnName,
        values: Array.from(uniqueValues),
        count: uniqueValues.size,
      });
    }
  });

  return patterns;
}

// Generate GraphQL type suggestions
function generateGraphQLTypeSuggestions(
  tableName,
  columns,
  patterns,
  relationships
) {
  const suggestions = {
    tableName: tableName,
    graphqlType: `type ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {`,
    fields: [],
    enums: [],
    inputs: [],
    queries: [],
  };

  columns.forEach((column) => {
    let graphqlType = "String";
    let nullable = true;

    // Determine GraphQL type based on patterns and metadata
    if (patterns.dateColumns.includes(column.name)) {
      graphqlType = "String"; // Could be DateTime if we add the scalar
    } else if (patterns.numericColumns.includes(column.name)) {
      graphqlType = "Float";
    } else if (patterns.booleanColumns.includes(column.name)) {
      graphqlType = "Boolean";
    } else if (patterns.jsonColumns.includes(column.name)) {
      graphqlType = "JSON"; // Would need custom scalar
    } else if (
      column.name.toLowerCase().includes("id") &&
      column.name.toLowerCase() !== "id"
    ) {
      graphqlType = "ID";
    }

    // Check if it's a primary key
    if (column.name.toLowerCase() === "id") {
      graphqlType = "ID!";
      nullable = false;
    }

    suggestions.fields.push(`  ${column.name}: ${graphqlType}`);
  });

  // Add relationship fields
  relationships.forEach((rel) => {
    suggestions.fields.push(
      `  ${rel.target_table}: ${rel.target_table.charAt(0).toUpperCase() + rel.target_table.slice(1)}`
    );
  });

  // Generate enum types
  patterns.enumCandidates.forEach((enumData) => {
    const enumName = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)}${enumData.column.charAt(0).toUpperCase() + enumData.column.slice(1)}Enum`;
    suggestions.enums.push({
      name: enumName,
      values: enumData.values,
    });
  });

  // Generate query suggestions
  suggestions.queries.push({
    name: `${tableName}`,
    type: "single",
    description: `Get a single ${tableName} by ID`,
  });

  suggestions.queries.push({
    name: `${tableName}s`,
    type: "list",
    description: `Get a list of ${tableName}s with pagination and filtering`,
  });

  return suggestions;
}

// Main exploration function
async function exploreSchemaEnhanced() {
  console.log(
    "🚀 Starting Enhanced Metabase schema exploration for complete GraphQL API..."
  );
  console.log(`🌐 Base URL: ${config.baseUrl}`);
  console.log(`🗄️  Database ID: ${config.databaseId}`);

  if (!config.apiKey) {
    console.error("❌ METABASE_API_KEY environment variable is required");
    process.exit(1);
  }

  const enhancedSchema = {
    database: {
      id: config.databaseId,
      url: config.baseUrl,
      explorationDate: new Date().toISOString(),
    },
    tables: [],
    relationships: [],
    graphqlSuggestions: {
      types: [],
      enums: [],
      queries: [],
      mutations: [],
    },
    statistics: {
      totalTables: 0,
      totalColumns: 0,
      totalRows: 0,
    },
  };

  try {
    // Get database schema
    const schema = await getDatabaseSchema();

    if (!schema.tables || schema.tables.length === 0) {
      console.log("⚠️  No tables found in the database");
      return enhancedSchema;
    }

    enhancedSchema.statistics.totalTables = schema.tables.length;
    console.log(
      `\n🔍 Found ${schema.tables.length} tables. Exploring each table in detail...`
    );

    // Explore each table
    for (const table of schema.tables) {
      console.log(`\n📊 Analyzing table: ${table.name} (ID: ${table.id})`);

      const tableInfo = {
        id: table.id,
        name: table.name,
        schema: table.schema,
        description: table.description,
        columns: [],
        relationships: [],
        dataVolume: 0,
        patterns: {},
        graphqlSuggestions: null,
      };

      // Get detailed metadata
      try {
        const metadata = await getTableMetadata(table.id);
        if (metadata.fields) {
          tableInfo.columns = metadata.fields.map((field) => ({
            name: field.name,
            baseType: field.base_type,
            specialType: field.special_type,
            description: field.description,
            isNullable: field.is_nullable !== false,
          }));
          enhancedSchema.statistics.totalColumns += metadata.fields.length;
        }

        // Get relationships
        tableInfo.relationships = await getTableRelationships(table.id);

        // Get data volume
        tableInfo.dataVolume = await getDataVolume(table.id);
        enhancedSchema.statistics.totalRows += tableInfo.dataVolume;

        // Get sample data for pattern analysis
        try {
          const sampleData = await getSampleData(table.id, 50);
          tableInfo.sampleData = sampleData.data?.rows?.slice(0, 5) || []; // Keep first 5 rows for reference

          // Analyze patterns
          tableInfo.patterns = analyzeDataPatterns(
            sampleData,
            tableInfo.columns
          );

          // Generate GraphQL suggestions
          tableInfo.graphqlSuggestions = generateGraphQLTypeSuggestions(
            table.name,
            tableInfo.columns,
            tableInfo.patterns,
            tableInfo.relationships
          );

          // Add to global suggestions
          enhancedSchema.graphqlSuggestions.types.push(
            tableInfo.graphqlSuggestions
          );
          enhancedSchema.graphqlSuggestions.enums.push(
            ...tableInfo.graphqlSuggestions.enums
          );
          enhancedSchema.graphqlSuggestions.queries.push(
            ...tableInfo.graphqlSuggestions.queries
          );
        } catch (sampleError) {
          console.log(
            `   ⚠️  Could not get sample data: ${sampleError.message}`
          );
        }
      } catch (metadataError) {
        console.log(`   ⚠️  Could not get metadata: ${metadataError.message}`);
      }

      enhancedSchema.tables.push(tableInfo);

      // Log summary for this table
      console.log(`   ✅ Columns: ${tableInfo.columns.length}`);
      console.log(`   ✅ Rows: ${tableInfo.dataVolume.toLocaleString()}`);
      console.log(`   ✅ Relationships: ${tableInfo.relationships.length}`);
      console.log(
        `   ✅ Patterns found: ${Object.keys(tableInfo.patterns).filter((k) => tableInfo.patterns[k].length > 0).length}`
      );
    }

    // Save comprehensive results
    const outputFile = "enhanced-schema-exploration-results.json";
    fs.writeFileSync(outputFile, JSON.stringify(enhancedSchema, null, 2));

    console.log(`\n✅ Enhanced schema exploration completed successfully!`);
    console.log(`📁 Results saved to: ${outputFile}`);
    console.log(`📊 Summary:`);
    console.log(`   - Tables: ${enhancedSchema.statistics.totalTables}`);
    console.log(`   - Columns: ${enhancedSchema.statistics.totalColumns}`);
    console.log(
      `   - Total Rows: ${enhancedSchema.statistics.totalRows.toLocaleString()}`
    );
    console.log(
      `   - GraphQL Types: ${enhancedSchema.graphqlSuggestions.types.length}`
    );
    console.log(
      `   - Enums: ${enhancedSchema.graphqlSuggestions.enums.length}`
    );
    console.log(
      `   - Queries: ${enhancedSchema.graphqlSuggestions.queries.length}`
    );

    return enhancedSchema;
  } catch (error) {
    console.error("❌ Enhanced schema exploration failed:", error.message);
    process.exit(1);
  }
}

// Run the exploration
if (require.main === module) {
  exploreSchemaEnhanced().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  exploreSchemaEnhanced,
  getDatabaseSchema,
  getTableMetadata,
  getSampleData,
  getColumnStatistics,
  getTableRelationships,
  getDataVolume,
  analyzeDataPatterns,
  generateGraphQLTypeSuggestions,
  makeMetabaseRequest,
};
