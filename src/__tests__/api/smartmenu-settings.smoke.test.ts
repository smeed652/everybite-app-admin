/**
 * SmartMenu Settings Lambda GraphQL Smoke Test
 *
 * Tests the SmartMenu settings query against the deployed Lambda endpoint
 * to ensure it works correctly without GraphQL field errors.
 */

import axios from "axios";

// Configuration
const LAMBDA_URL =
  process.env.LAMBDA_URL ||
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = process.env.API_KEY || "3SB3ZawcNr3AT11vxKruJ";

// SmartMenu settings query
const SMARTMENU_SETTINGS_QUERY = `
  query GetSmartMenuSettings {
    db_widgetsList {
      items {
        # Core identification
        id
        name
        # slug - removed as not available in datawarehouse schema

        # Timestamps
        createdAt
        updatedAt
        publishedAt

        # Dashboard metrics
        numberOfLocations
        numberOfLocationsSource

        # Analytics - Feature adoption
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled

        # Chain classifications - will be added in future
        # chain_nra_classifications {
        #   nra_classification
        # }
        # chain_menu_classifications {
        #   menu_type
        # }
        # chain_cuisine_classifications {
        #   cuisine_type
        # }

        # Analytics - Performance - will be added in future
        # isActive
        # isSyncEnabled
        # lastSyncedAt

        # Settings - Colors and branding
        primaryBrandColor
        highlightColor
        backgroundColor

        # Settings - URLs and links
        orderUrl
        # logoWidth - will be added in future
        # faviconUrl - will be added in future
        # widgetLogoUrl - will be added in future
        # widgetUrl - will be added in future

        # Settings - Dietary and allergen preferences
        # supportedDietaryPreferences - will be added in future
        supportedAllergens
        # displayIngredients - will be added in future
        # displayNutrientPreferences - will be added in future
        # displayMacronutrients - will be added in future

        # Settings - CTA and feedback flags
        displaySoftSignUp
        displayNotifyMeBanner
        displayGiveFeedbackBanner
        displayFeedbackButton
        displayDishDetailsLink

        # Settings - Navigation and pagination - will be added in future
        # displayNavbar
        # usePagination
        # displayFooter
        # footerText

        # Settings - Button styling (not currently in use)
        # buttonFont
        # buttonBackgroundColor
        # buttonTextColor
        # buttonBorderRadius

        # Settings - Typography and text colors (not currently in use)
        # categoryTitleFont
        # categoryTitleTextColor
        # contentAreaGlobalColor
        # contentAreaColumnHeaderColor
        # subheaderFont
        # subheaderLocationTextColor
        # subheaderAdditionalTextColor
        # navbarFont
        # navbarFontSize
        # navbarBackgroundColor

        # Settings - Page content (not currently in use)
        # htmlTitleText
        # pageTitleText
        # pageTitleTextColor
      }
      pagination {
        total
      }
    }

    # Quarterly metrics for orders
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      locations {
        count
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;

// Helper function to make GraphQL requests
async function executeQuery(query: string) {
  try {
    const response = await axios.post(
      `${LAMBDA_URL}/graphql`,
      {
        query: query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      data: response.data.data,
      errors: response.data.errors,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      response: error.response?.data,
    };
  }
}

describe("SmartMenu Settings Lambda GraphQL Test", () => {
  beforeAll(() => {
    console.log(`🧪 Testing SmartMenu Settings query on: ${LAMBDA_URL}`);
    console.log(`🔑 Using API key: ${API_KEY.substring(0, 8)}...`);
  });

  test("should execute SmartMenu settings query without GraphQL field errors", async () => {
    const result = await executeQuery(SMARTMENU_SETTINGS_QUERY);

    // Log the result for debugging
    console.log("Query result:", {
      success: result.success,
      hasErrors: !!result.errors,
      errorCount: result.errors?.length || 0,
      hasData: !!result.data,
    });

    if (result.errors) {
      console.log("GraphQL errors:", result.errors);
    }

    // The main test: should succeed without GraphQL field errors
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();

    // Should return the expected data structure
    expect(result.data?.db_widgetsList).toBeDefined();
    expect(result.data?.quarterlyMetrics).toBeDefined();
  }, 30000); // 30 second timeout

  test("should return widgets list with proper structure", async () => {
    const result = await executeQuery(SMARTMENU_SETTINGS_QUERY);

    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();

    const { db_widgetsList } = result.data;
    expect(db_widgetsList).toBeDefined();
    expect(Array.isArray(db_widgetsList.items)).toBe(true);
    expect(db_widgetsList.pagination).toBeDefined();
    expect(typeof db_widgetsList.pagination.total).toBe("number");

    // If there are widgets, verify the structure
    if (db_widgetsList.items.length > 0) {
      const firstWidget = db_widgetsList.items[0];
      expect(firstWidget.id).toBeDefined();
      expect(firstWidget.name).toBeDefined();

      // Verify slug field is NOT present (as it was removed from datawarehouse schema)
      expect(firstWidget.slug).toBeUndefined();
    }
  }, 30000);

  test("should return quarterly metrics with proper structure", async () => {
    const result = await executeQuery(SMARTMENU_SETTINGS_QUERY);

    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();

    const { quarterlyMetrics } = result.data;
    expect(Array.isArray(quarterlyMetrics)).toBe(true);

    if (quarterlyMetrics.length > 0) {
      const firstMetric = quarterlyMetrics[0];
      expect(firstMetric.quarter).toBeDefined();
      expect(firstMetric.year).toBeDefined();
      expect(firstMetric.quarterLabel).toBeDefined();
      expect(firstMetric.orders).toBeDefined();
      expect(firstMetric.activeSmartMenus).toBeDefined();
      expect(firstMetric.locations).toBeDefined();
    }
  }, 30000);
});
