const { ApolloServer } = require("apollo-server-lambda");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { gql } = require("apollo-server-lambda");

// Import our schema and resolvers
const analyticsSchema = require("./schema/analytics");
const analyticsResolvers = require("./resolvers/analytics");

// Mock Metabase query execution for testing
const mockExecuteMetabaseQuery = async (query) => {
  console.log("🔍 Mock executing query:", JSON.stringify(query, null, 2));

  // Simulate the totalMetrics query result
  if (
    query.native.query.includes("total_orders") &&
    query.native.query.includes("total_diner_visits")
  ) {
    return {
      data: {
        rows: [[150, 75]], // total_orders, total_diner_visits
      },
    };
  }

  return {
    data: {
      rows: [],
    },
  };
};

// Create the schema
const typeDefs = gql`
  ${analyticsSchema}
`;

const resolvers = {
  ...analyticsResolvers,
  Query: {
    ...analyticsResolvers.Query,
    // Override with mock context
    totalMetrics: async (_, args, context) => {
      return analyticsResolvers.Query.totalMetrics(_, args, {
        executeMetabaseQuery: mockExecuteMetabaseQuery,
      });
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Test the query
async function testTotalMetrics() {
  const testQuery = `
    query TestTotalMetrics($startDate: String!, $endDate: String!) {
      totalMetrics(startDate: $startDate, endDate: $endDate) {
        totalOrders
        totalDinerVisits
        startDate
        endDate
      }
    }
  `;

  const variables = {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  };

  try {
    console.log("🧪 Testing totalMetrics query...");
    console.log("📋 Query:", testQuery);
    console.log("🔧 Variables:", JSON.stringify(variables, null, 2));

    const result = await schema
      .getQueryType()
      .getFields()
      .totalMetrics.resolve(null, variables, {
        executeMetabaseQuery: mockExecuteMetabaseQuery,
      });

    console.log("✅ Result:", JSON.stringify(result, null, 2));

    if (
      result.totalOrders !== undefined &&
      result.totalDinerVisits !== undefined
    ) {
      console.log(
        "🎉 Test passed! New totalMetrics query is working correctly."
      );
    } else {
      console.log("❌ Test failed! Missing expected fields.");
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testTotalMetrics();
