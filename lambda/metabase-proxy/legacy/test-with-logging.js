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

async function testWithLogging() {
  try {
    const jwt = await getCognitoJwt();
    console.log("✅ Obtained JWT token");

    // Test 1: Quarterly Metrics
    console.log("\n🔍 Test 1: Quarterly Metrics...");
    const quarterlyQuery = {
      query: `
        query GetQuarterlyMetrics {
          quarterlyMetrics {
            quarter
            activeSmartMenus
            totalOrders
            brands
            totalLocations
            qoqGrowth
          }
        }
      `,
    };

    const response1 = await axios.post(LAMBDA_URL, quarterlyQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      timeout: 30000,
    });

    console.log("✅ Quarterly Metrics response:");
    console.log(JSON.stringify(response1.data, null, 2));

    // Test 2: Daily Orders with date range
    console.log("\n🔍 Test 2: Daily Orders with date range...");
    const dailyOrdersQuery = {
      query: `
        query GetDailyOrders {
          dailyOrders(startDate: "2024-01-01", endDate: "2025-01-01") {
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

    console.log(
      "\n📋 Check CloudWatch logs for detailed debugging information!"
    );
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.status, error.response.data);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

testWithLogging();
