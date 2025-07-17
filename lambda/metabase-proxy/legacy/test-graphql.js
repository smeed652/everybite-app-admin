// Test script for GraphQL endpoint
const axios = require("axios");

const LAMBDA_URL =
  process.env.LAMBDA_URL ||
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";

async function testGraphQL() {
  try {
    console.log("Testing GraphQL endpoint...");

    // Test introspection query
    const introspectionQuery = {
      query: `
        query IntrospectionQuery {
          __schema {
            types {
              name
              fields {
                name
                type {
                  name
                }
              }
            }
          }
        }
      `,
    };

    const response = await axios.post(
      `${LAMBDA_URL}/graphql`,
      introspectionQuery,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "GraphQL introspection response:",
      JSON.stringify(response.data, null, 2)
    );

    // Test analytics query
    const analyticsQuery = {
      query: `
        query GetWidgetAnalytics {
          widgetAnalytics {
            views {
              totalVisits
              uniqueVisitors
              repeatedVisits
            }
            dailyInteractions {
              date
              count
            }
          }
        }
      `,
    };

    const analyticsResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      analyticsQuery,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Analytics query response:",
      JSON.stringify(analyticsResponse.data, null, 2)
    );
  } catch (error) {
    console.error(
      "Error testing GraphQL:",
      error.response?.data || error.message
    );
  }
}

testGraphQL();
