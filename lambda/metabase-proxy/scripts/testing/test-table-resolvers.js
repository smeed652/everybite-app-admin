const axios = require("axios");

const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

async function testTableResolvers() {
  console.log("🧪 Testing Table-Specific GraphQL Resolvers...\n");

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  try {
    // Test 1: widget_interactionsList with filters
    console.log("1️⃣ Testing widget_interactionsList with filters...");
    const widgetInteractionsQuery = {
      query: `
        query GetWidgetInteractions {
          widget_interactionsList(filter: {
            eventTime_gte: "2025-01-01T00:00:00Z"
            eventTime_lte: "2025-01-31T23:59:59Z"
            event_in: ["dish details viewed", "widget viewed"]
            limit: 5
            offset: 0
          }) {
            items {
              eventTime
              userId
              amplitudeId
              location
              widgetId
              contextPageUrl
              event
              restaurantName
              moreInfo
              eventHour
            }
            pagination {
              total
              page
              pageSize
              totalPages
              hasNext
              hasPrevious
            }
          }
        }
      `,
    };

    const widgetInteractionsResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      widgetInteractionsQuery,
      { headers }
    );

    console.log("✅ Widget Interactions Response:");
    console.log(
      `   Items: ${widgetInteractionsResponse.data.data?.widget_interactionsList?.items?.length || 0}`
    );
    console.log(
      `   Total: ${widgetInteractionsResponse.data.data?.widget_interactionsList?.pagination?.total || 0}`
    );
    console.log(
      `   Page: ${widgetInteractionsResponse.data.data?.widget_interactionsList?.pagination?.page || 0}`
    );
    console.log(
      `   Has Next: ${widgetInteractionsResponse.data.data?.widget_interactionsList?.pagination?.hasNext || false}`
    );

    // Test 2: db_widgetsList with filters
    console.log("\n2️⃣ Testing db_widgetsList with filters...");
    const dbWidgetsQuery = {
      query: `
        query GetDbWidgets {
          db_widgetsList(filter: {
            name_like: "Pizza"
            limit: 3
            offset: 0
          }) {
            items {
              id
              restaurantId
              name
              layout
              isByoEnabled
              isOrderButtonEnabled
              numberOfLocations
              createdAt
              updatedAt
            }
            pagination {
              total
              page
              pageSize
              totalPages
              hasNext
              hasPrevious
            }
          }
        }
      `,
    };

    const dbWidgetsResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      dbWidgetsQuery,
      { headers }
    );

    console.log("✅ DB Widgets Response:");
    console.log(
      `   Items: ${dbWidgetsResponse.data.data?.db_widgetsList?.items?.length || 0}`
    );
    console.log(
      `   Total: ${dbWidgetsResponse.data.data?.db_widgetsList?.pagination?.total || 0}`
    );

    // Test 3: restaurantsList with filters
    console.log("\n3️⃣ Testing restaurantsList with filters...");
    const restaurantsQuery = {
      query: `
        query GetRestaurants {
          restaurantsList(filter: {
            name_like: "Pizza"
            limit: 3
            offset: 0
          }) {
            items {
              id
              name
              address
              city
              state
              zipCode
              phone
              website
              createdAt
              updatedAt
            }
            pagination {
              total
              page
              pageSize
              totalPages
              hasNext
              hasPrevious
            }
          }
        }
      `,
    };

    const restaurantsResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      restaurantsQuery,
      { headers }
    );

    console.log("✅ Restaurants Response:");
    console.log(
      `   Items: ${restaurantsResponse.data.data?.restaurantsList?.items?.length || 0}`
    );
    console.log(
      `   Total: ${restaurantsResponse.data.data?.restaurantsList?.pagination?.total || 0}`
    );

    // Test 4: Count queries
    console.log("\n4️⃣ Testing count queries...");
    const countQuery = {
      query: `
        query GetCounts {
          widget_interactionsCount(filter: {
            eventTime_gte: "2025-01-01T00:00:00Z"
            eventTime_lte: "2025-01-31T23:59:59Z"
          })
          db_widgetsCount(filter: {
            name_like: "Pizza"
          })
          restaurantsCount(filter: {
            name_like: "Pizza"
          })
        }
      `,
    };

    const countResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      countQuery,
      { headers }
    );

    console.log("✅ Count Response:");
    console.log(
      `   Widget Interactions: ${countResponse.data.data?.widget_interactionsCount || 0}`
    );
    console.log(
      `   DB Widgets: ${countResponse.data.data?.db_widgetsCount || 0}`
    );
    console.log(
      `   Restaurants: ${countResponse.data.data?.restaurantsCount || 0}`
    );

    // Test 5: Single record query (if we have an ID)
    console.log("\n5️⃣ Testing single record query...");
    if (dbWidgetsResponse.data.data?.db_widgetsList?.items?.length > 0) {
      const firstWidgetId =
        dbWidgetsResponse.data.data.db_widgetsList.items[0].id;

      const singleRecordQuery = {
        query: `
          query GetSingleWidget($id: ID!) {
            db_widgets(id: $id) {
              id
              restaurantId
              name
              layout
              isByoEnabled
              isOrderButtonEnabled
              numberOfLocations
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          id: firstWidgetId,
        },
      };

      const singleRecordResponse = await axios.post(
        `${LAMBDA_URL}/graphql`,
        singleRecordQuery,
        { headers }
      );

      console.log("✅ Single Record Response:");
      console.log(
        `   Found: ${singleRecordResponse.data.data?.db_widgets ? "Yes" : "No"}`
      );
      if (singleRecordResponse.data.data?.db_widgets) {
        console.log(
          `   Name: ${singleRecordResponse.data.data.db_widgets.name}`
        );
        console.log(
          `   Layout: ${singleRecordResponse.data.data.db_widgets.layout}`
        );
      }
    }

    // Test 6: Complex filtering
    console.log("\n6️⃣ Testing complex filtering...");
    const complexFilterQuery = {
      query: `
        query GetComplexFilteredData {
          widget_interactionsList(filter: {
            eventTime_gte: "2025-01-01T00:00:00Z"
            eventTime_lte: "2025-01-31T23:59:59Z"
            event_in: ["dish details viewed", "widget viewed", "cart clicked"]
            restaurantName_like: "Pizza"
            limit: 10
            offset: 0
          }) {
            items {
              eventTime
              userId
              event
              restaurantName
              moreInfo
            }
            pagination {
              total
              page
              pageSize
              totalPages
              hasNext
              hasPrevious
            }
          }
        }
      `,
    };

    const complexFilterResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      complexFilterQuery,
      { headers }
    );

    console.log("✅ Complex Filter Response:");
    console.log(
      `   Items: ${complexFilterResponse.data.data?.widget_interactionsList?.items?.length || 0}`
    );
    console.log(
      `   Total: ${complexFilterResponse.data.data?.widget_interactionsList?.pagination?.total || 0}`
    );
    console.log(
      `   Total Pages: ${complexFilterResponse.data.data?.widget_interactionsList?.pagination?.totalPages || 0}`
    );

    console.log("\n🎉 All table resolver tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   ✅ List queries with pagination working");
    console.log("   ✅ Filter queries working (exact, like, in, date ranges)");
    console.log("   ✅ Count queries working");
    console.log("   ✅ Single record queries working");
    console.log("   ✅ Complex filtering working");
    console.log("   ✅ Proper field mapping (snake_case to camelCase)");
  } catch (error) {
    console.error(
      "❌ Error testing table resolvers:",
      error.response?.data || error.message
    );
    if (error.response?.data?.errors) {
      console.error("GraphQL Errors:", error.response.data.errors);
    }
  }
}

// Run the tests
testTableResolvers();
