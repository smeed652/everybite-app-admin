const axios = require("axios");

const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws/graphql";
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

async function testChainClassifications() {
  console.log("🧪 Testing Chain Classification Resolvers...\n");

  const query = `
    query TestChainClassifications {
      db_widgetsList(filter: {}) {
        items {
          id
          name
          chain_nra_classifications {
            nra_classification
          }
          chain_menu_classifications {
            menu_type
          }
          chain_cuisine_classifications {
            cuisine_type
          }
        }
        pagination {
          total
        }
      }
    }
  `;

  try {
    console.log("📡 Sending GraphQL query...");
    const response = await axios.post(
      LAMBDA_URL,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        timeout: 30000,
      }
    );

    console.log("✅ Response received:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      console.log("❌ GraphQL errors:");
      response.data.errors.forEach((error) => {
        console.log(`  - ${error.message}`);
      });
    }

    const widgets = response.data.data?.db_widgetsList?.items || [];
    console.log(`\n📊 Found ${widgets.length} widgets`);

    widgets.forEach((widget, index) => {
      console.log(`\n🔍 Widget ${index + 1}: ${widget.name}`);
      console.log(
        `  NRA Classifications: ${widget.chain_nra_classifications?.length || 0}`
      );
      console.log(
        `  Menu Classifications: ${widget.chain_menu_classifications?.length || 0}`
      );
      console.log(
        `  Cuisine Classifications: ${widget.chain_cuisine_classifications?.length || 0}`
      );
    });
  } catch (error) {
    console.error("❌ Error testing chain classifications:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testChainClassifications();
