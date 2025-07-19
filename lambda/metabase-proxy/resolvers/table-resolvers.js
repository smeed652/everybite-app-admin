const tableResolvers = {
  Query: {
    // Generic table resolver for single record queries
    // This will handle queries like: tableName(id: ID!): Type
    ...generateTableResolvers(),

    // Generic table list resolver for filtered queries
    // This will handle queries like: tableNameList(filter: TypeFilter): TypeList
    ...generateTableListResolvers(),

    // Generic table count resolver
    // This will handle queries like: tableNameCount(filter: TypeFilter): Int!
    ...generateTableCountResolvers(),
  },
};

// Generate resolvers for all tables
function generateTableResolvers() {
  const resolvers = {};

  // Key tables with detailed column mapping
  const keyTables = [
    "widget_interactions",
    "db_widgets",
    "db_orders",
    "db_diners",
    "restaurants",
    "dishes",
  ];

  // Generate resolvers for key tables
  keyTables.forEach((tableName) => {
    resolvers[tableName] = async (_, { id }, { executeMetabaseQuery }) => {
      try {
        const query = {
          database: 2,
          type: "native",
          native: {
            query: `SELECT * FROM everybite_analytics.${tableName} WHERE id = '${id}' LIMIT 1`,
          },
        };

        const result = await executeMetabaseQuery(query);

        if (!result.data?.rows || result.data.rows.length === 0) {
          return null;
        }

        const row = result.data.rows[0];
        const columns = result.data.cols?.map((col) => col.name) || [];

        // Convert row to object with proper field mapping
        const record = {};
        columns.forEach((col, index) => {
          const fieldName = toCamelCase(col);
          record[fieldName] = row[index];
        });

        return record;
      } catch (error) {
        console.error(`❌ Error in ${tableName} resolver:`, error);
        throw new Error(`Failed to fetch ${tableName} record`);
      }
    };
  });

  return resolvers;
}

// Generate list resolvers for all tables
function generateTableListResolvers() {
  const resolvers = {};

  // Only generate resolvers for tables that are defined in the schema
  const schemaTables = [
    "widget_interactions",
    "db_widgets",
    "db_orders",
    "db_diners",
    "restaurants",
    "dishes",
  ];

  schemaTables.forEach((tableName) => {
    const listResolverName = `${tableName}List`;

    resolvers[listResolverName] = async (
      _,
      { filter = {} },
      { executeMetabaseQuery }
    ) => {
      try {
        // Build WHERE clause from filter
        const whereClause = buildWhereClause(tableName, filter);

        // Get pagination parameters
        const limit = filter.limit || 100;
        const offset = filter.offset || 0;

        // Build query - Athena doesn't support OFFSET, so we'll use a different approach
        let query;
        if (offset === 0) {
          // Simple case: no offset, just limit
          query = {
            database: 2,
            type: "native",
            native: {
              query: `SELECT * FROM everybite_analytics.${tableName} WHERE ${whereClause} LIMIT ${limit}`,
            },
          };
        } else {
          // For offset > 0, we need to use a window function approach
          query = {
            database: 2,
            type: "native",
            native: {
              query: `
                SELECT * FROM (
                  SELECT *, ROW_NUMBER() OVER (ORDER BY id) as rn 
                  FROM everybite_analytics.${tableName} 
                  WHERE ${whereClause}
                ) t 
                WHERE rn > ${offset} AND rn <= ${offset + limit}
              `,
            },
          };
        }

        // Get total count for pagination
        const countQuery = {
          database: 2,
          type: "native",
          native: {
            query: `SELECT COUNT(*) as total FROM everybite_analytics.${tableName} WHERE ${whereClause}`,
          },
        };

        const [result, countResult] = await Promise.all([
          executeMetabaseQuery(query),
          executeMetabaseQuery(countQuery),
        ]);

        const total = countResult.data?.rows?.[0]?.[0] || 0;
        const rows = result.data?.rows || [];
        const columns = result.data?.cols?.map((col) => col.name) || [];

        // Convert rows to objects with proper field mapping
        const items = rows.map((row) => {
          const record = {};
          columns.forEach((col, index) => {
            const fieldName = toCamelCase(col);
            record[fieldName] = row[index];
          });
          return record;
        });

        // Calculate pagination info
        const page = Math.floor(offset / limit) + 1;
        const pageSize = limit;
        const totalPages = Math.ceil(total / pageSize);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        const paginationInfo = {
          total,
          page,
          pageSize,
          totalPages,
          hasNext,
          hasPrevious,
        };

        return {
          items,
          pagination: paginationInfo,
        };
      } catch (error) {
        console.error(`❌ Error in ${listResolverName} resolver:`, error);
        throw new Error(`Failed to fetch ${tableName} list`);
      }
    };
  });

  return resolvers;
}

// Generate count resolvers for all tables
function generateTableCountResolvers() {
  const resolvers = {};

  // Only generate resolvers for tables that are defined in the schema
  const schemaTables = [
    "widget_interactions",
    "db_widgets",
    "db_orders",
    "db_diners",
    "restaurants",
    "dishes",
  ];

  schemaTables.forEach((tableName) => {
    const countResolverName = `${tableName}Count`;

    resolvers[countResolverName] = async (
      _,
      { filter = {} },
      { executeMetabaseQuery }
    ) => {
      try {
        // Build WHERE clause from filter
        const whereClause = buildWhereClause(tableName, filter);

        const query = {
          database: 2,
          type: "native",
          native: {
            query: `SELECT COUNT(*) as total FROM everybite_analytics.${tableName} WHERE ${whereClause}`,
          },
        };

        const result = await executeMetabaseQuery(query);
        const count = result.data?.rows?.[0]?.[0] || 0;

        return count;
      } catch (error) {
        console.error(`❌ Error in ${countResolverName} resolver:`, error);
        throw new Error(`Failed to count ${tableName} records`);
      }
    };
  });

  return resolvers;
}

// Helper function to build WHERE clause from filter
function buildWhereClause(tableName, filter) {
  let whereClause = "1=1";

  // Handle different filter types
  Object.entries(filter).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const columnName = toSnakeCase(key);

    // Handle special filter types
    if (key.endsWith("_in") && Array.isArray(value)) {
      const baseColumn = toSnakeCase(key.replace("_in", ""));
      const values = value.map((v) => `'${v}'`).join(", ");
      whereClause += ` AND ${baseColumn} IN (${values})`;
    } else if (key.endsWith("_like") && typeof value === "string") {
      const baseColumn = toSnakeCase(key.replace("_like", ""));
      whereClause += ` AND ${baseColumn} ILIKE '%${value}%'`;
    } else if (key.endsWith("_gte") && typeof value === "string") {
      const baseColumn = toSnakeCase(key.replace("_gte", ""));
      whereClause += ` AND ${baseColumn} >= '${value}'`;
    } else if (key.endsWith("_lte") && typeof value === "string") {
      const baseColumn = toSnakeCase(key.replace("_lte", ""));
      whereClause += ` AND ${baseColumn} <= '${value}'`;
    } else if (key === "limit" || key === "offset") {
      // Skip pagination parameters
      return;
    } else {
      // Regular equality filter
      if (typeof value === "string") {
        whereClause += ` AND ${columnName} = '${value}'`;
      } else {
        whereClause += ` AND ${columnName} = ${value}`;
      }
    }
  });

  return whereClause;
}

// Helper function to convert snake_case to camelCase
function toCamelCase(str) {
  // Handle the typo in the database column name
  if (str === "higlight_color") {
    return "highlightColor";
  }
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(str) {
  // Handle the typo in the database column name
  if (str === "highlightColor") {
    return "higlight_color";
  }
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

module.exports = tableResolvers;
