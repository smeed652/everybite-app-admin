const axios = require("axios");

const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = "3SB3ZawcNr3AT11vxKruJ";

async function testEnhancedQueries() {
  console.log("🧪 Testing Enhanced GraphQL Queries...\n");

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  try {
    // Test 1: tableMetadata query
    console.log("1️⃣ Testing tableMetadata query...");
    const tableMetadataQuery = {
      query: `
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
      `,
      variables: {
        tableName: "widget_interactions",
      },
    };

    const tableMetadataResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      tableMetadataQuery,
      { headers }
    );

    console.log("✅ tableMetadata response:");
    console.log(JSON.stringify(tableMetadataResponse.data, null, 2));

    // Test 2: dataVolume query
    console.log("\n2️⃣ Testing dataVolume query...");
    const dataVolumeQuery = {
      query: `
        query GetDataVolume($tableName: String!) {
          dataVolume(tableName: $tableName) {
            rowCount
            estimatedSize
            lastUpdated
          }
        }
      `,
      variables: {
        tableName: "widget_interactions",
      },
    };

    const dataVolumeResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      dataVolumeQuery,
      { headers }
    );

    console.log("✅ dataVolume response:");
    console.log(JSON.stringify(dataVolumeResponse.data, null, 2));

    // Test 3: sampleData query
    console.log("\n3️⃣ Testing sampleData query...");
    const sampleDataQuery = {
      query: `
        query GetSampleData($tableName: String!, $limit: Int) {
          sampleData(tableName: $tableName, limit: $limit) {
            columns
            rows
          }
        }
      `,
      variables: {
        tableName: "widget_interactions",
        limit: 5,
      },
    };

    const sampleDataResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      sampleDataQuery,
      { headers }
    );

    console.log("✅ sampleData response:");
    console.log(JSON.stringify(sampleDataResponse.data, null, 2));

    // Test 4: tableRelationships query
    console.log("\n4️⃣ Testing tableRelationships query...");
    const tableRelationshipsQuery = {
      query: `
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
      `,
      variables: {
        tableName: "widget_interactions",
      },
    };

    const tableRelationshipsResponse = await axios.post(
      `${LAMBDA_URL}/graphql`,
      tableRelationshipsQuery,
      { headers }
    );

    console.log("✅ tableRelationships response:");
    console.log(JSON.stringify(tableRelationshipsResponse.data, null, 2));

    console.log("\n🎉 All enhanced queries tested successfully!");
  } catch (error) {
    console.error(
      "❌ Error testing enhanced queries:",
      error.response?.data || error.message
    );
  }
}

testEnhancedQueries();
