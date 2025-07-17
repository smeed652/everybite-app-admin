const axios = require("axios");

class GraphQLClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };
  }

  async query(queryString, variables = {}) {
    try {
      const graphqlUrl = `${this.baseUrl}/graphql`;

      const response = await axios.post(
        graphqlUrl,
        {
          query: queryString,
          variables,
        },
        { headers: this.headers }
      );

      if (response.data.errors) {
        throw new Error(
          `GraphQL Errors: ${JSON.stringify(response.data.errors)}`
        );
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
        );
      }
      throw error;
    }
  }

  async testConnection() {
    const query = `
      query TestConnection {
        info {
          lambdaVersion
          environment
          deployTimestamp
          gitCommit
        }
      }
    `;

    return this.query(query);
  }
}

module.exports = GraphQLClient;
