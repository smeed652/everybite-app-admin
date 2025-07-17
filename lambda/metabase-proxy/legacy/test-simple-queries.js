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

async function testSimpleQueries() {
  try {
    const jwt = await getCognitoJwt();
    console.log("✅ Obtained JWT token");

    // Test 1: Check total orders
    console.log("\n🔍 Test 1: Total orders count...");
    const totalOrdersQuery = {
      query: `
        query {
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

    const response1 = await axios.post(LAMBDA_URL, totalOrdersQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      timeout: 30000,
    });

    console.log("✅ Widget Analytics response:");
    console.log(JSON.stringify(response1.data, null, 2));

    // Test 2: Check daily orders
    console.log("\n🔍 Test 2: Daily orders...");
    const dailyOrdersQuery = {
      query: `
        query GetDailyOrders {
          dailyOrders {
            date
            count
          }
        }
      `,
    };

    const response2 = await axios.post(LAMBDA_URL, dailyOrdersQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      timeout: 30000,
    });

    console.log("✅ Daily Orders response:");
    console.log(JSON.stringify(response2.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.status, error.response.data);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

testSimpleQueries();
