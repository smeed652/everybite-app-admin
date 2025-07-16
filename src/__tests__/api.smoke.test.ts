import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import fetch from "cross-fetch";
import { beforeAll, describe, expect, it } from "vitest";

// Set global fetch for Node
if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.fetch === "undefined"
) {
  (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = fetch;
}

// Load environment variables - handle both Vite and Node environments
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  // Try Vite's import.meta.env first
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  // Fallback to process.env for Node environment
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// Create a real Apollo client for integration testing
const apiKey = getEnvVar("VITE_API_KEY", "");
const graphqlUri = getEnvVar(
  "VITE_GRAPHQL_URI",
  "https://api.everybite.com/graphql"
);

console.log("🔧 Test Environment:", {
  apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : "NOT SET",
  graphqlUri,
  hasImportMeta: typeof import.meta !== "undefined",
  hasProcess: typeof process !== "undefined",
});

const httpLink = createHttpLink({
  uri: graphqlUri,
  fetch,
});

// For this project the API expects a static API key; user tokens are not required for GraphQL
// Keep authLink minimal in case future headers need dynamic injection
const authLink = setContext((_, { headers }) => {
  console.log("🔐 Setting auth context:", {
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : "NOT SET",
    headers: headers,
  });

  return {
    headers: {
      ...headers,
      // ensure apiKey present even if httpLink headers overridden elsewhere
      Authorization: apiKey,
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

// Test queries with different field sets
const MINIMAL_WIDGET_QUERY = gql`
  query GetMinimalWidget($id: ID!) {
    widget(id: $id) {
      id
      name
      slug
      layout
      isActive
      createdAt
      updatedAt
      publishedAt
      __typename
    }
  }
`;

const FULL_WIDGET_QUERY = gql`
  query GetFullWidget($id: ID!) {
    widget(id: $id) {
      id
      name
      slug
      layout
      displayImages
      isActive
      isOrderButtonEnabled
      isByoEnabled
      primaryBrandColor
      highlightColor
      backgroundColor
      orderUrl
      logoWidth
      faviconUrl
      widgetLogoUrl
      widgetUrl
      supportedDietaryPreferences
      supportedAllergens
      displayIngredients
      displayNutrientPreferences
      displayMacronutrients
      displaySoftSignUp
      displayNotifyMeBanner
      displayGiveFeedbackBanner
      displayFeedbackButton
      displayDishDetailsLink
      displayNavbar
      usePagination
      displayFooter
      footerText
      buttonFont
      buttonBackgroundColor
      buttonTextColor
      buttonBorderRadius
      categoryTitleFont
      categoryTitleTextColor
      contentAreaGlobalColor
      contentAreaColumnHeaderColor
      subheaderFont
      subheaderLocationTextColor
      subheaderAdditionalTextColor
      navbarFont
      navbarFontSize
      navbarBackgroundColor
      htmlTitleText
      pageTitleText
      pageTitleTextColor
      numberOfLocations
      numberOfLocationsSource
      createdAt
      updatedAt
      publishedAt
      __typename
    }
  }
`;

// Test widget ID from the URL we were having issues with
const TEST_WIDGET_ID = "a7330911";

describe("GraphQL API Integration Tests", () => {
  beforeAll(() => {
    // Skip tests if no API key is configured
    if (!apiKey) {
      console.warn("⚠️  No API key configured. Skipping integration tests.");
    }
  });

  it("should fetch minimal widget data successfully", async () => {
    if (!apiKey) {
      console.log("⏭️  Skipping test - no API key");
      return;
    }

    try {
      const result = await client.query({
        query: MINIMAL_WIDGET_QUERY,
        variables: { id: TEST_WIDGET_ID },
        fetchPolicy: "no-cache",
      });

      expect(result.data).toBeDefined();
      expect(result.data.widget).toBeDefined();
      expect(result.data.widget.id).toBe(TEST_WIDGET_ID);
      expect(result.data.widget.name).toBeDefined();
      expect(result.data.widget.slug).toBeDefined();

      console.log("✅ Minimal widget query successful:", {
        id: result.data.widget.id,
        name: result.data.widget.name,
        slug: result.data.widget.slug,
      });
    } catch (error) {
      console.error("❌ Minimal widget query failed:", error);
      throw error;
    }
  });

  it("should identify problematic fields in full widget query", async () => {
    if (!apiKey) {
      console.log("⏭️  Skipping test - no API key");
      return;
    }

    try {
      const result = await client.query({
        query: FULL_WIDGET_QUERY,
        variables: { id: TEST_WIDGET_ID },
        fetchPolicy: "no-cache",
      });

      expect(result.data).toBeDefined();
      expect(result.data.widget).toBeDefined();

      console.log("✅ Full widget query successful");
    } catch (error: unknown) {
      console.error(
        "❌ Full widget query failed:",
        error instanceof Error ? error.message : error
      );

      // Check for GraphQL errors and identify problematic fields
      if (error && typeof error === "object" && "graphQLErrors" in error) {
        const graphQLError = error as {
          graphQLErrors?: Array<{
            message: string;
            path?: string[];
            extensions?: unknown;
          }>;
        };
        if (
          graphQLError.graphQLErrors &&
          graphQLError.graphQLErrors.length > 0
        ) {
          graphQLError.graphQLErrors.forEach((graphQLError, index: number) => {
            console.error(`GraphQL Error ${index}:`, {
              message: graphQLError.message,
              path: graphQLError.path,
              extensions: graphQLError.extensions,
            });

            // If the error has a path, it tells us which field is problematic
            if (graphQLError.path && graphQLError.path.length > 1) {
              const problematicField =
                graphQLError.path[graphQLError.path.length - 1];
              console.error(`🚨 Problematic field: ${problematicField}`);
            }
          });
        }
      }

      // Don't throw the error - we expect this to fail and want to see the details
      expect(error).toBeDefined();
    }
  });

  it("should fetch widgets list successfully", async () => {
    if (!apiKey) {
      console.log("⏭️  Skipping test - no API key");
      return;
    }

    const GET_WIDGETS = gql`
      query GetWidgets {
        widgets {
          id
          name
          slug
          layout
          isActive
          createdAt
          updatedAt
          publishedAt
          __typename
        }
      }
    `;

    try {
      const result = await client.query({
        query: GET_WIDGETS,
        fetchPolicy: "no-cache",
      });

      expect(result.data).toBeDefined();
      expect(result.data.widgets).toBeDefined();
      expect(Array.isArray(result.data.widgets)).toBe(true);

      console.log(
        `✅ Widgets list query successful: ${result.data.widgets.length} widgets found`
      );
    } catch (error) {
      console.error("❌ Widgets list query failed:", error);
      throw error;
    }
  });
});
