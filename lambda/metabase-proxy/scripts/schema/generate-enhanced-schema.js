const fs = require("fs");

// Load the enhanced schema data
const enhancedSchemaData = JSON.parse(
  fs.readFileSync("enhanced-schema-results.json", "utf8")
);

// Define detailed column information for key tables based on the data we have
const keyTableColumns = {
  widget_interactions: [
    {
      name: "event_time",
      type: "timestamp",
      nullable: false,
      description: "Event timestamp",
    },
    {
      name: "user_id",
      type: "varchar",
      nullable: false,
      description: "User identifier",
    },
    {
      name: "amplitude_id",
      type: "bigint",
      nullable: false,
      description: "Amplitude analytics ID",
    },
    {
      name: "location",
      type: "varchar",
      nullable: false,
      description: "Geographic location",
    },
    {
      name: "widget_id",
      type: "varchar",
      nullable: false,
      description: "Widget identifier",
    },
    {
      name: "context_page_url",
      type: "varchar",
      nullable: false,
      description: "Page URL where event occurred",
    },
    {
      name: "event",
      type: "varchar",
      nullable: false,
      description: "Event type",
    },
    {
      name: "restaurant_name",
      type: "varchar",
      nullable: false,
      description: "Restaurant name",
    },
    {
      name: "more_info",
      type: "varchar",
      nullable: false,
      description: "Additional event information",
    },
    {
      name: "event_hour",
      type: "timestamp",
      nullable: false,
      description: "Hour-level timestamp",
    },
  ],
  db_widgets: [
    { name: "id", type: "string", nullable: false, description: "Widget ID" },
    {
      name: "restaurant_id",
      type: "string",
      nullable: false,
      description: "Restaurant identifier",
    },
    {
      name: "created_at",
      type: "timestamp",
      nullable: false,
      description: "Creation timestamp",
    },
    {
      name: "updated_at",
      type: "timestamp",
      nullable: false,
      description: "Last update timestamp",
    },
    {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      description: "Deletion timestamp",
    },
    {
      name: "background_color",
      type: "string",
      nullable: true,
      description: "Background color",
    },
    {
      name: "higlight_color",
      type: "string",
      nullable: true,
      description: "Highlight color",
    },
    {
      name: "name",
      type: "string",
      nullable: false,
      description: "Widget name",
    },
    {
      name: "primary_brand_color",
      type: "string",
      nullable: true,
      description: "Primary brand color",
    },
    {
      name: "display_images",
      type: "boolean",
      nullable: true,
      description: "Whether to display images",
    },
    {
      name: "font_family",
      type: "string",
      nullable: true,
      description: "Font family",
    },
    {
      name: "display_feedback_button",
      type: "boolean",
      nullable: true,
      description: "Whether to display feedback button",
    },
    {
      name: "display_soft_sign_up",
      type: "boolean",
      nullable: true,
      description: "Whether to display soft sign up",
    },
    {
      name: "published_at",
      type: "timestamp",
      nullable: true,
      description: "Publication timestamp",
    },
    {
      name: "display_dish_details_link",
      type: "boolean",
      nullable: true,
      description: "Whether to display dish details link",
    },
    {
      name: "display_give_feedback_banner",
      type: "boolean",
      nullable: true,
      description: "Whether to display feedback banner",
    },
    {
      name: "display_notify_me_banner",
      type: "boolean",
      nullable: true,
      description: "Whether to display notify me banner",
    },
    {
      name: "layout",
      type: "string",
      nullable: true,
      description: "Layout type",
    },
    {
      name: "is_byo_enabled",
      type: "boolean",
      nullable: true,
      description: "Whether BYO is enabled",
    },
    {
      name: "is_order_button_enabled",
      type: "boolean",
      nullable: true,
      description: "Whether order button is enabled",
    },
    {
      name: "supported_allergens",
      type: "ARRAY<INT>",
      nullable: true,
      description: "Supported allergens",
    },
    {
      name: "order_url",
      type: "string",
      nullable: true,
      description: "Order URL",
    },
    {
      name: "number_of_locations",
      type: "int",
      nullable: true,
      description: "Number of locations",
    },
    {
      name: "number_of_locations_source",
      type: "string",
      nullable: true,
      description: "Source for location count",
    },
  ],
  db_orders: [
    { name: "id", type: "string", nullable: false, description: "Order ID" },
    {
      name: "diner_id",
      type: "string",
      nullable: false,
      description: "Diner identifier",
    },
    {
      name: "restaurant_id",
      type: "string",
      nullable: false,
      description: "Restaurant identifier",
    },
    {
      name: "created_at",
      type: "timestamp",
      nullable: false,
      description: "Creation timestamp",
    },
    {
      name: "updated_at",
      type: "timestamp",
      nullable: false,
      description: "Last update timestamp",
    },
    {
      name: "status",
      type: "string",
      nullable: false,
      description: "Order status",
    },
    {
      name: "total_amount",
      type: "decimal",
      nullable: true,
      description: "Total order amount",
    },
    {
      name: "currency",
      type: "string",
      nullable: true,
      description: "Currency code",
    },
  ],
  db_diners: [
    { name: "id", type: "string", nullable: false, description: "Diner ID" },
    {
      name: "email",
      type: "string",
      nullable: true,
      description: "Email address",
    },
    {
      name: "created_at",
      type: "timestamp",
      nullable: false,
      description: "Creation timestamp",
    },
    {
      name: "updated_at",
      type: "timestamp",
      nullable: false,
      description: "Last update timestamp",
    },
    {
      name: "first_name",
      type: "string",
      nullable: true,
      description: "First name",
    },
    {
      name: "last_name",
      type: "string",
      nullable: true,
      description: "Last name",
    },
    {
      name: "phone",
      type: "string",
      nullable: true,
      description: "Phone number",
    },
  ],
  restaurants: [
    {
      name: "id",
      type: "string",
      nullable: false,
      description: "Restaurant ID",
    },
    {
      name: "name",
      type: "string",
      nullable: false,
      description: "Restaurant name",
    },
    {
      name: "created_at",
      type: "timestamp",
      nullable: false,
      description: "Creation timestamp",
    },
    {
      name: "updated_at",
      type: "timestamp",
      nullable: false,
      description: "Last update timestamp",
    },
    { name: "address", type: "string", nullable: true, description: "Address" },
    { name: "city", type: "string", nullable: true, description: "City" },
    { name: "state", type: "string", nullable: true, description: "State" },
    {
      name: "zip_code",
      type: "string",
      nullable: true,
      description: "ZIP code",
    },
    {
      name: "phone",
      type: "string",
      nullable: true,
      description: "Phone number",
    },
    {
      name: "website",
      type: "string",
      nullable: true,
      description: "Website URL",
    },
  ],
  dishes: [
    { name: "id", type: "string", nullable: false, description: "Dish ID" },
    {
      name: "restaurant_id",
      type: "string",
      nullable: false,
      description: "Restaurant identifier",
    },
    { name: "name", type: "string", nullable: false, description: "Dish name" },
    {
      name: "description",
      type: "string",
      nullable: true,
      description: "Dish description",
    },
    {
      name: "price",
      type: "decimal",
      nullable: true,
      description: "Dish price",
    },
    {
      name: "category",
      type: "string",
      nullable: true,
      description: "Dish category",
    },
    {
      name: "created_at",
      type: "timestamp",
      nullable: false,
      description: "Creation timestamp",
    },
    {
      name: "updated_at",
      type: "timestamp",
      nullable: false,
      description: "Last update timestamp",
    },
  ],
};

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
  array: "String",
  "ARRAY<INT>": "String",
  "ARRAY<STRING>": "String",
};

// Convert column name to GraphQL field name
function toGraphQLFieldName(columnName) {
  return columnName.replace(/_([a-z])/g, (match, letter) =>
    letter.toUpperCase()
  );
}

// Determine GraphQL type from column data
function getGraphQLType(columnType) {
  const lowerType = columnType.toLowerCase();

  // Handle special cases
  if (lowerType.includes("array")) {
    return "[String]";
  }

  if (
    lowerType.includes("timestamp") ||
    lowerType.includes("datetime") ||
    lowerType.includes("date")
  ) {
    return "String";
  }

  // Map to GraphQL type
  for (const [sqlType, graphqlType] of Object.entries(graphqlTypeMap)) {
    if (lowerType.includes(sqlType)) {
      return graphqlType;
    }
  }

  return "String";
}

// Generate GraphQL type for a table
function generateTableType(tableName, columns) {
  const typeName = tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  let typeDefinition = `  type ${typeName} {\n`;

  // Add all columns
  columns.forEach((column) => {
    const fieldName = toGraphQLFieldName(column.name);
    const fieldType = getGraphQLType(column.type);
    const nullable = column.nullable ? "" : "!";
    const description = column.description ? ` # ${column.description}` : "";

    typeDefinition += `    ${fieldName}: ${fieldType}${nullable}${description}\n`;
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
    const fieldType = getGraphQLType(column.type);

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
      col.type.toLowerCase().includes("timestamp") ||
      col.type.toLowerCase().includes("date")
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
function generateEnhancedGraphQLSchema() {
  console.log("🚀 Generating Enhanced GraphQL Schema...");

  const tables = enhancedSchemaData.tables;

  let schema = `# Enhanced GraphQL Schema for EveryBite Analytics
# Generated on: ${new Date().toISOString()}
# Total Tables: ${tables.length}
# READ-ONLY API - No mutations implemented
# Key tables have detailed column mapping

`;

  // Add pagination type
  schema += generatePaginationType();

  // Generate types for key tables with detailed columns
  console.log(`📝 Generating detailed types for key tables...`);

  const generatedTypes = [];
  const generatedFilters = [];

  // Generate detailed types for key tables
  Object.entries(keyTableColumns).forEach(([tableName, columns]) => {
    console.log(`  📊 ${tableName} - ${columns.length} columns`);

    const tableType = generateTableType(tableName, columns);
    generatedTypes.push(tableType);

    const filterType = generateFilterInputs(tableName, columns);
    generatedFilters.push(filterType);
  });

  // Generate basic types for remaining tables
  console.log(`📝 Generating basic types for remaining tables...`);

  const remainingTables = tables.filter(
    (table) => !keyTableColumns[table.tableName]
  );

  remainingTables.forEach((table, index) => {
    const tableName = table.tableName;
    console.log(`  ${index + 1}/${remainingTables.length}: ${tableName}`);

    // Generate basic type for tables without detailed metadata
    const basicColumns = [
      {
        name: "id",
        type: "string",
        nullable: false,
        description: "Primary identifier",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: true,
        description: "Creation timestamp",
      },
      {
        name: "updated_at",
        type: "timestamp",
        nullable: true,
        description: "Last update timestamp",
      },
    ];

    const tableType = generateTableType(tableName, basicColumns);
    generatedTypes.push(tableType);

    const filterType = generateFilterInputs(tableName, basicColumns);
    generatedFilters.push(filterType);
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
const generatedSchema = generateEnhancedGraphQLSchema();

fs.writeFileSync("enhanced-schema.graphql", generatedSchema);

console.log("✅ Enhanced GraphQL Schema Generated Successfully!");
console.log(`📁 Output: enhanced-schema.graphql`);
console.log(
  `📊 Generated types for ${enhancedSchemaData.tables.length} tables`
);
console.log(`🔍 Schema includes:`);
console.log(
  `   • Detailed types for ${Object.keys(keyTableColumns).length} key tables`
);
console.log(
  `   • Basic types for ${enhancedSchemaData.tables.length - Object.keys(keyTableColumns).length} remaining tables`
);
console.log(`   • Filter input types for each table`);
console.log(`   • Pagination support`);
console.log(`   • List types for bulk queries`);
console.log(`   • Read-only Query type (no mutations)`);
console.log(`   • Enhanced schema exploration queries`);
console.log(`   • Existing analytics queries preserved`);

// Generate a summary report
const summary = {
  generatedAt: new Date().toISOString(),
  totalTables: enhancedSchemaData.tables.length,
  keyTablesWithDetailedColumns: Object.keys(keyTableColumns).length,
  remainingTablesWithBasicColumns:
    enhancedSchemaData.tables.length - Object.keys(keyTableColumns).length,
  keyTables: Object.keys(keyTableColumns),
  schemaFeatures: [
    "Read-only API (no mutations)",
    "Detailed column mapping for key tables",
    "Basic types for remaining tables",
    "Filter input types for each table",
    "Pagination support",
    "List types for bulk queries",
    "Enhanced schema exploration queries",
    "Existing analytics queries preserved",
  ],
};

fs.writeFileSync(
  "enhanced-schema-summary.json",
  JSON.stringify(summary, null, 2)
);
console.log(`📋 Summary: enhanced-schema-summary.json`);
