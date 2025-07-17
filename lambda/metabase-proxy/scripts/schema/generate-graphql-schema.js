const fs = require("fs");

// Load the enhanced schema data
const enhancedSchemaData = JSON.parse(
  fs.readFileSync("enhanced-schema-results.json", "utf8")
);

// GraphQL type mapping
const graphqlTypeMap = {
  string: "String",
  varchar: "String",
  text: "String",
  char: "String",
  boolean: "Boolean",
  bool: "Boolean",
  int: "Int",
  integer: "Int",
  bigint: "Int",
  smallint: "Int",
  float: "Float",
  double: "Float",
  decimal: "Float",
  numeric: "Float",
  timestamp: "String",
  datetime: "String",
  date: "String",
  time: "String",
  json: "String",
  jsonb: "String",
  array: "String", // Will be handled specially
  "ARRAY<INT>": "String", // Will be handled specially
  "ARRAY<STRING>": "String", // Will be handled specially
};

// Convert column name to GraphQL field name
function toGraphQLFieldName(columnName) {
  // Remove data type suffix if present
  const cleanName = columnName.split("\t")[0].trim();

  // Convert snake_case to camelCase
  return cleanName.replace(/_([a-z])/g, (match, letter) =>
    letter.toUpperCase()
  );
}

// Determine GraphQL type from column data
function getGraphQLType(columnName, dataType) {
  // Extract clean column name and type
  const parts = columnName.split("\t");
  const cleanName = parts[0].trim();
  const type = dataType || parts[1]?.trim() || "string";

  // Handle special cases
  if (type.includes("ARRAY")) {
    return "[String]"; // Arrays will be serialized as JSON strings
  }

  if (
    type.includes("timestamp") ||
    type.includes("datetime") ||
    type.includes("date")
  ) {
    return "String"; // Timestamps as ISO strings
  }

  // Map to GraphQL type
  const lowerType = type.toLowerCase();
  for (const [sqlType, graphqlType] of Object.entries(graphqlTypeMap)) {
    if (lowerType.includes(sqlType)) {
      return graphqlType;
    }
  }

  // Default to String for unknown types
  return "String";
}

// Generate GraphQL type for a table
function generateTableType(tableName, columns, rowCount) {
  const typeName = tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  let typeDefinition = `  type ${typeName} {\n`;

  // Add ID field if not present
  const hasId = columns.some(
    (col) =>
      col.name.toLowerCase().includes("id") &&
      !col.name.toLowerCase().includes("widget_id") &&
      !col.name.toLowerCase().includes("user_id")
  );

  if (!hasId) {
    typeDefinition += `    id: ID!\n`;
  }

  // Add all columns
  columns.forEach((column) => {
    const fieldName = toGraphQLFieldName(column.name);
    const fieldType = getGraphQLType(column.name, column.dataType);
    const nullable = column.isNullable ? "" : "!";

    typeDefinition += `    ${fieldName}: ${fieldType}${nullable}\n`;
  });

  typeDefinition += `  }\n\n`;

  return {
    typeName,
    definition: typeDefinition,
  };
}

// Generate input types for filtering
function generateFilterInputs(tableName, columns) {
  const typeName = tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  let filterDefinition = `  input ${typeName}Filter {\n`;

  // Add common filter fields
  columns.forEach((column) => {
    const fieldName = toGraphQLFieldName(column.name);
    const fieldType = getGraphQLType(column.name, column.dataType);

    // Skip complex types for filters
    if (
      fieldType === "String" ||
      fieldType === "Int" ||
      fieldType === "Float" ||
      fieldType === "Boolean"
    ) {
      filterDefinition += `    ${fieldName}: ${fieldType}\n`;
      filterDefinition += `    ${fieldName}_in: [${fieldType}]\n`;
      if (fieldType === "String") {
        filterDefinition += `    ${fieldName}_like: String\n`;
      }
    }
  });

  // Add date range filters for timestamp fields
  const timestampColumns = columns.filter(
    (col) =>
      col.name.toLowerCase().includes("time") ||
      col.name.toLowerCase().includes("date") ||
      col.name.toLowerCase().includes("created") ||
      col.name.toLowerCase().includes("updated")
  );

  timestampColumns.forEach((column) => {
    const fieldName = toGraphQLFieldName(column.name);
    filterDefinition += `    ${fieldName}_gte: String\n`;
    filterDefinition += `    ${fieldName}_lte: String\n`;
  });

  filterDefinition += `    limit: Int\n`;
  filterDefinition += `    offset: Int\n`;
  filterDefinition += `  }\n\n`;

  return {
    typeName: `${typeName}Filter`,
    definition: filterDefinition,
  };
}

// Generate pagination type
function generatePaginationType() {
  return `  type PaginationInfo {
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrevious: Boolean!
  }

`;
}

// Generate query fields
function generateQueryFields(tables) {
  let queryFields = `  type Query {\n`;

  // Add existing queries
  queryFields += `    # Existing analytics queries\n`;
  queryFields += `    widgetAnalytics(filters: AnalyticsFilters): WidgetAnalytics!\n`;
  queryFields += `    dailyInteractions(filters: AnalyticsFilters): [DailyInteraction!]!\n`;
  queryFields += `    quarterlyMetrics(startQuarter: String, endQuarter: String): [QuarterlyMetrics!]!\n`;
  queryFields += `    dailyOrders(startDate: String, endDate: String): [DailyOrders!]!\n`;
  queryFields += `    totalMetrics(startDate: String!, endDate: String!): TotalMetrics!\n`;
  queryFields += `    schemaExploration: SchemaExploration!\n`;
  queryFields += `    info: LambdaInfo!\n\n`;

  // Add enhanced schema exploration queries
  queryFields += `    # Enhanced schema exploration queries\n`;
  queryFields += `    tableMetadata(tableName: String!): TableMetadata\n`;
  queryFields += `    dataVolume(tableName: String!): DataVolume\n`;
  queryFields += `    tableRelationships(tableName: String!): TableRelationships\n`;
  queryFields += `    sampleData(tableName: String!, limit: Int): SampleData\n\n`;

  // Add table-specific queries
  queryFields += `    # Table-specific queries\n`;

  tables.forEach((table) => {
    const tableName = table.tableName;
    const typeName = tableName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    // Single record query
    queryFields += `    ${tableName}(id: ID!): ${typeName}\n`;

    // List query with filters
    queryFields += `    ${tableName}List(filter: ${typeName}Filter): ${typeName}List\n`;

    // Count query
    queryFields += `    ${tableName}Count(filter: ${typeName}Filter): Int!\n`;
  });

  queryFields += `  }\n\n`;

  return queryFields;
}

// Generate list types
function generateListTypes(tables) {
  let listTypes = "";

  tables.forEach((table) => {
    const tableName = table.tableName;
    const typeName = tableName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    listTypes += `  type ${typeName}List {
    items: [${typeName}!]!
    pagination: PaginationInfo!
  }

`;
  });

  return listTypes;
}

// Main generation function
function generateGraphQLSchema() {
  console.log("🚀 Generating GraphQL Schema from Enhanced Data...");

  const tables = enhancedSchemaData.tables;
  const detailedTables = enhancedSchemaData.detailedMetadata || {};

  let schema = `# Generated GraphQL Schema for EveryBite Analytics
# Generated on: ${new Date().toISOString()}
# Total Tables: ${tables.length}
# READ-ONLY API - No mutations implemented

`;

  // Add pagination type
  schema += generatePaginationType();

  // Generate types for all tables
  console.log(`📝 Generating types for ${tables.length} tables...`);

  const generatedTypes = [];
  const generatedFilters = [];

  tables.forEach((table, index) => {
    const tableName = table.tableName;
    console.log(`  ${index + 1}/${tables.length}: ${tableName}`);

    // Get detailed metadata if available
    const detailedTable = detailedTables[tableName];
    const columns = detailedTable?.columns || [];
    const rowCount = detailedTable?.rowCount || 0;

    if (columns.length > 0) {
      // Generate table type
      const tableType = generateTableType(tableName, columns, rowCount);
      generatedTypes.push(tableType);

      // Generate filter input
      const filterType = generateFilterInputs(tableName, columns);
      generatedFilters.push(filterType);
    } else {
      // Generate basic type for tables without detailed metadata
      const basicColumns = [
        { name: "id\tstring", dataType: "string", isNullable: false },
        {
          name: "created_at\ttimestamp",
          dataType: "timestamp",
          isNullable: true,
        },
        {
          name: "updated_at\ttimestamp",
          dataType: "timestamp",
          isNullable: true,
        },
      ];

      const tableType = generateTableType(tableName, basicColumns, 0);
      generatedTypes.push(tableType);

      const filterType = generateFilterInputs(tableName, basicColumns);
      generatedFilters.push(filterType);
    }
  });

  // Add all type definitions
  generatedTypes.forEach((type) => {
    schema += type.definition;
  });

  // Add all filter definitions
  generatedFilters.forEach((filter) => {
    schema += filter.definition;
  });

  // Add list types
  schema += generateListTypes(tables);

  // Add query fields
  schema += generateQueryFields(tables);

  // Add schema definition
  schema += `schema {
  query: Query
}

`;

  return schema;
}

// Generate and save the schema
const generatedSchema = generateGraphQLSchema();

fs.writeFileSync("generated-schema.graphql", generatedSchema);

console.log("✅ GraphQL Schema Generated Successfully!");
console.log(`📁 Output: generated-schema.graphql`);
console.log(
  `📊 Generated types for ${enhancedSchemaData.tables.length} tables`
);
console.log(`🔍 Schema includes:`);
console.log(`   • Table types with proper field mapping`);
console.log(`   • Filter input types for each table`);
console.log(`   • Pagination support`);
console.log(`   • List types for bulk queries`);
console.log(`   • Read-only Query type (no mutations)`);
console.log(`   • Enhanced schema exploration queries`);

// Generate a summary report
const summary = {
  generatedAt: new Date().toISOString(),
  totalTables: enhancedSchemaData.tables.length,
  tablesWithDetailedMetadata: Object.keys(
    enhancedSchemaData.detailedMetadata || {}
  ).length,
  schemaFeatures: [
    "Read-only API (no mutations)",
    "Table-specific types with proper field mapping",
    "Filter input types for each table",
    "Pagination support",
    "List types for bulk queries",
    "Enhanced schema exploration queries",
    "Existing analytics queries preserved",
  ],
  tableNames: enhancedSchemaData.tables.map((t) => t.tableName),
};

fs.writeFileSync(
  "schema-generation-summary.json",
  JSON.stringify(summary, null, 2)
);
console.log(`📋 Summary: schema-generation-summary.json`);
