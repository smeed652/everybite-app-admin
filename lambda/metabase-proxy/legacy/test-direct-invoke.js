const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({ region: "us-west-1" });

async function testDirectInvoke() {
  const payload = {
    httpMethod: "POST",
    path: "/graphql",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    },
    body: JSON.stringify({
      query: "{ widgetAnalytics { totalWidgets } }",
    }),
  };

  try {
    const command = new InvokeCommand({
      FunctionName: "metabase-proxy-dev",
      Payload: JSON.stringify(payload),
    });

    const response = await client.send(command);

    console.log("Status Code:", response.StatusCode);
    console.log("Function Error:", response.FunctionError);

    if (response.Payload) {
      const payload = JSON.parse(Buffer.from(response.Payload).toString());
      console.log("Response:", JSON.stringify(payload, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testDirectInvoke();
