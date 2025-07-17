const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const axios = require("axios");

// CONFIGURATION
const REGION = "us-west-1";
const CLIENT_ID = "746d7c6ituu4n572hef100m5s7";
const USERNAME = "cypress-test@example.com";
const PASSWORD = "Test123!";
const LAMBDA_URL =
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws/graphql";

async function getCognitoJwt() {
  const client = new CognitoIdentityProviderClient({ region: REGION });
  const authCommand = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME,
      PASSWORD,
    },
  });

  const authResponse = await client.send(authCommand);

  if (authResponse.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    const challengeCommand = new RespondToAuthChallengeCommand({
      ClientId: CLIENT_ID,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: authResponse.Session,
      ChallengeResponses: {
        USERNAME,
        NEW_PASSWORD: PASSWORD,
      },
    });
    const challengeResponse = await client.send(challengeCommand);
    return challengeResponse.AuthenticationResult.IdToken;
  }

  return authResponse.AuthenticationResult.IdToken;
}

async function testTableData() {
  try {
    const jwt = await getCognitoJwt();
    console.log("✅ Obtained JWT token");

    // Test 1: Check what's in widget_interactions table
    console.log("\n🔍 Test 1: Check widget_interactions table data...");
    const widgetInteractionsQuery = {
      query: `
        query {
          dailyInteractions {
            date
            count
          }
        }
      `,
    };

    const response1 = await axios.post(LAMBDA_URL, widgetInteractionsQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      timeout: 30000,
    });

    console.log("✅ Daily Interactions response (first 5 records):");
    const interactions = response1.data.data?.dailyInteractions || [];
    console.log(JSON.stringify(interactions.slice(0, 5), null, 2));
    console.log(`Total records: ${interactions.length}`);

    // Test 2: Check if there's any data in the last 30 days
    console.log("\n🔍 Test 2: Check recent data...");
    const recentDataQuery = {
      query: `
        query GetRecentData {
          dailyOrders(startDate: "2025-06-01", endDate: "2025-07-16") {
            date
            count
          }
        }
      `,
    };

    const response2 = await axios.post(LAMBDA_URL, recentDataQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      timeout: 30000,
    });

    console.log("✅ Recent Data response:");
    console.log(JSON.stringify(response2.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.status, error.response.data);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

testTableData();
