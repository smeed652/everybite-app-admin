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

async function testQuarterlyMetrics() {
  try {
    const jwt = await getCognitoJwt();
    console.log("✅ Obtained JWT token");

    // Test quarterly metrics query
    const graphqlQuery = {
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

    console.log("🔍 Testing quarterly metrics query...");
    const response = await axios.post(LAMBDA_URL, graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      timeout: 30000,
    });

    console.log("✅ Lambda GraphQL response:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.data?.quarterlyMetrics?.length === 0) {
      console.log("⚠️  Warning: quarterlyMetrics array is empty");
    } else {
      console.log(
        `✅ Found ${response.data.data?.quarterlyMetrics?.length} quarterly metrics records`
      );
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.status, error.response.data);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

testQuarterlyMetrics();
