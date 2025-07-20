/**
 * Lambda GraphQL Smoke Tests
 *
 * Tests all 7 new Lambda GraphQL queries against the deployed endpoint
 * to ensure they work correctly in production.
 */

import axios from "axios";

// Configuration
const LAMBDA_URL =
  process.env.LAMBDA_URL ||
  "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";
const API_KEY = process.env.API_KEY || "3SB3ZawcNr3AT11vxKruJ";

// GraphQL queries for all new analytics
const QUERIES = {
  dashboardMetrics: `
    query DashboardMetrics {
      dashboardMetrics {
        widgetSummary {
          totalWidgets
          activeWidgets
          totalLocations
          totalOrders
          averageOrdersPerWidget
        }
        quarterlyMetrics {
          quarter
          year
          quarterLabel
          brands {
            count
            qoqGrowth
            qoqGrowthPercent
          }
          locations {
            count
            qoqGrowth
            qoqGrowthPercent
          }
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
          totalRevenue {
            amount
            qoqGrowth
            qoqGrowthPercent
          }
        }
        kpis {
          totalRevenue
          totalDinerVisits
          averageOrderValue
          conversionRate
        }
      }
    }
  `,

  featureAdoption: `
    query FeatureAdoption {
      featureAdoption {
        totalActive
        withImages
        withCardLayout
        withOrdering
        withByo
      }
    }
  `,

  quarterlyTrends: `
    query QuarterlyTrends {
      quarterlyTrends {
        quarter
        year
        quarterLabel
        totalOrders
        activeWidgets
        newWidgets
        newBrands
        newLocations
      }
    }
  `,

  monthlyGrowth: `
    query MonthlyGrowth {
      monthlyGrowth {
        month
        year
        monthNum
        monthLabel
        totalOrders
        activeWidgets
        newWidgets
        newBrands
      }
    }
  `,

  dailyOrdersTrends: `
    query DailyOrdersTrends {
      dailyOrdersTrends {
        day
        dayLabel
        totalOrders
        activeWidgets
        uniqueUsers
      }
    }
  `,

  activationInsights: `
    query ActivationInsights {
      activationInsights {
        activationStats {
          status
          count
          avgLocations
        }
        recentActivations {
          week
          weekLabel
          activations
        }
      }
    }
  `,

  retentionAnalytics: `
    query RetentionAnalytics {
      retentionAnalytics {
        cohortMonth
        monthLabel
        cohortSize
        firstTimeUsers
        returningUsers
        retentionRate
      }
    }
  `,

  smartMenuSettings: `
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
  `,
};

// Helper function to make GraphQL requests
async function executeQuery(queryName: string, query: string) {
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
      queryName,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: (error as Error).message,
      queryName,
    };
  }
}

describe("Lambda GraphQL Smoke Tests", () => {
  beforeAll(() => {
    console.log(`🧪 Testing Lambda GraphQL endpoint: ${LAMBDA_URL}`);
    console.log(`🔑 Using API key: ${API_KEY.substring(0, 8)}...`);
  });

  describe("Basic Connectivity", () => {
    test("should connect to Lambda GraphQL endpoint", async () => {
      const result = await executeQuery("connectivity", "{ __typename }");
      expect(result.success).toBe(true);
    });

    test("should require API key for access", async () => {
      try {
        await axios.post(
          `${LAMBDA_URL}/graphql`,
          { query: "{ __typename }" },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          }
        );
        fail("Should have required API key");
      } catch (error: unknown) {
        expect(
          (error as { response?: { status: number } }).response?.status
        ).toBe(401);
      }
    });
  });

  describe("Dashboard Metrics Query", () => {
    test("should return dashboard metrics with widget summary", async () => {
      const result = await executeQuery(
        "dashboardMetrics",
        QUERIES.dashboardMetrics
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.data?.dashboardMetrics).toBeDefined();

      const { widgetSummary } = result.data.dashboardMetrics;
      expect(widgetSummary).toBeDefined();
      expect(typeof widgetSummary.totalWidgets).toBe("number");
      expect(typeof widgetSummary.activeWidgets).toBe("number");
      expect(typeof widgetSummary.totalLocations).toBe("number");
      expect(typeof widgetSummary.totalOrders).toBe("number");
      expect(typeof widgetSummary.averageOrdersPerWidget).toBe("number");

      // Validate data ranges
      expect(widgetSummary.totalWidgets).toBeGreaterThan(0);
      expect(widgetSummary.activeWidgets).toBeGreaterThanOrEqual(0);
      expect(widgetSummary.totalLocations).toBeGreaterThanOrEqual(0);
      expect(widgetSummary.totalOrders).toBeGreaterThanOrEqual(0);
    });

    test("should return quarterly metrics array", async () => {
      const result = await executeQuery(
        "dashboardMetrics",
        QUERIES.dashboardMetrics
      );

      expect(result.success).toBe(true);
      expect(
        Array.isArray(result.data?.dashboardMetrics?.quarterlyMetrics)
      ).toBe(true);
    });

    test("should return KPIs object", async () => {
      const result = await executeQuery(
        "dashboardMetrics",
        QUERIES.dashboardMetrics
      );

      expect(result.success).toBe(true);
      expect(result.data?.dashboardMetrics?.kpis).toBeDefined();

      const { kpis } = result.data.dashboardMetrics;
      expect(typeof kpis.totalRevenue).toBe("number");
      expect(typeof kpis.totalDinerVisits).toBe("number");
      expect(typeof kpis.averageOrderValue).toBe("number");
      expect(typeof kpis.conversionRate).toBe("number");
    });
  });

  describe("Feature Adoption Query", () => {
    test("should return feature adoption statistics", async () => {
      const result = await executeQuery(
        "featureAdoption",
        QUERIES.featureAdoption
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.data?.featureAdoption).toBeDefined();

      const fa = result.data.featureAdoption;
      expect(typeof fa.totalActive).toBe("number");
      expect(typeof fa.withImages).toBe("number");
      expect(typeof fa.withCardLayout).toBe("number");
      expect(typeof fa.withOrdering).toBe("number");
      expect(typeof fa.withByo).toBe("number");

      // Validate data consistency
      expect(fa.totalActive).toBeGreaterThanOrEqual(0);
      expect(fa.withImages).toBeLessThanOrEqual(fa.totalActive);
      expect(fa.withCardLayout).toBeLessThanOrEqual(fa.totalActive);
      expect(fa.withOrdering).toBeLessThanOrEqual(fa.totalActive);
      expect(fa.withByo).toBeLessThanOrEqual(fa.totalActive);
    });
  });

  describe("Quarterly Trends Query", () => {
    test("should return quarterly trends data", async () => {
      const result = await executeQuery(
        "quarterlyTrends",
        QUERIES.quarterlyTrends
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(Array.isArray(result.data?.quarterlyTrends)).toBe(true);

      const trends = result.data.quarterlyTrends;
      expect(trends.length).toBeGreaterThan(0);

      // Validate first trend entry
      const firstTrend = trends[0];
      expect(firstTrend.quarter).toBeDefined();
      expect(firstTrend.year).toBeDefined();
      expect(firstTrend.quarterLabel).toBeDefined();
      expect(typeof firstTrend.totalOrders).toBe("number");
      expect(typeof firstTrend.activeWidgets).toBe("number");
      expect(typeof firstTrend.newWidgets).toBe("number");
      expect(typeof firstTrend.newBrands).toBe("number");
      expect(typeof firstTrend.newLocations).toBe("number");
    });

    test("should have valid quarter labels", async () => {
      const result = await executeQuery(
        "quarterlyTrends",
        QUERIES.quarterlyTrends
      );

      expect(result.success).toBe(true);
      const trends = result.data.quarterlyTrends;

      trends.forEach((trend: { quarterLabel: string; year: number }) => {
        expect(trend.quarterLabel).toMatch(/^Q[1-4] \d{4}$/);
        expect(trend.year).toBeGreaterThan(2020);
        expect(trend.year).toBeLessThan(2030);
      });
    });
  });

  describe("Monthly Growth Query", () => {
    test("should return monthly growth data", async () => {
      const result = await executeQuery("monthlyGrowth", QUERIES.monthlyGrowth);

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(Array.isArray(result.data?.monthlyGrowth)).toBe(true);

      const growth = result.data.monthlyGrowth;
      expect(growth.length).toBeGreaterThan(0);

      // Validate first growth entry
      const firstGrowth = growth[0];
      expect(firstGrowth.month).toBeDefined();
      expect(firstGrowth.year).toBeDefined();
      expect(firstGrowth.monthNum).toBeDefined();
      expect(firstGrowth.monthLabel).toBeDefined();
      expect(typeof firstGrowth.totalOrders).toBe("number");
      expect(typeof firstGrowth.activeWidgets).toBe("number");
      expect(typeof firstGrowth.newWidgets).toBe("number");
      expect(typeof firstGrowth.newBrands).toBe("number");
    });

    test("should have valid month numbers", async () => {
      const result = await executeQuery("monthlyGrowth", QUERIES.monthlyGrowth);

      expect(result.success).toBe(true);
      const growth = result.data.monthlyGrowth;

      growth.forEach((month: { monthNum: number; year: number }) => {
        expect(month.monthNum).toBeGreaterThanOrEqual(1);
        expect(month.monthNum).toBeLessThanOrEqual(12);
        expect(month.year).toBeGreaterThan(2020);
        expect(month.year).toBeLessThan(2030);
      });
    });
  });

  describe("Daily Orders Trends Query", () => {
    test("should return daily orders trends data", async () => {
      const result = await executeQuery(
        "dailyOrdersTrends",
        QUERIES.dailyOrdersTrends
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(Array.isArray(result.data?.dailyOrdersTrends)).toBe(true);

      const trends = result.data.dailyOrdersTrends;
      expect(trends.length).toBeGreaterThan(0);

      // Validate first trend entry
      const firstTrend = trends[0];
      expect(firstTrend.day).toBeDefined();
      expect(firstTrend.dayLabel).toBeDefined();
      expect(typeof firstTrend.totalOrders).toBe("number");
      expect(typeof firstTrend.activeWidgets).toBe("number");
      expect(typeof firstTrend.uniqueUsers).toBe("number");
    });

    test("should have valid day labels", async () => {
      const result = await executeQuery(
        "dailyOrdersTrends",
        QUERIES.dailyOrdersTrends
      );

      expect(result.success).toBe(true);
      const trends = result.data.dailyOrdersTrends;

      trends.forEach(
        (trend: {
          dayLabel: string;
          totalOrders: number;
          activeWidgets: number;
          uniqueUsers: number;
        }) => {
          expect(trend.dayLabel).toMatch(/^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}$/);
          expect(trend.totalOrders).toBeGreaterThanOrEqual(0);
          expect(trend.activeWidgets).toBeGreaterThanOrEqual(0);
          expect(trend.uniqueUsers).toBeGreaterThanOrEqual(0);
        }
      );
    });
  });

  describe("Activation Insights Query", () => {
    test("should return activation insights structure", async () => {
      const result = await executeQuery(
        "activationInsights",
        QUERIES.activationInsights
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.data?.activationInsights).toBeDefined();

      const insights = result.data.activationInsights;
      expect(Array.isArray(insights.activationStats)).toBe(true);
      expect(Array.isArray(insights.recentActivations)).toBe(true);
    });
  });

  describe("Retention Analytics Query", () => {
    test("should return retention analytics structure", async () => {
      const result = await executeQuery(
        "retentionAnalytics",
        QUERIES.retentionAnalytics
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(Array.isArray(result.data?.retentionAnalytics)).toBe(true);
    });
  });

  describe("SmartMenu Settings Query", () => {
    test("should return SmartMenu settings data without GraphQL errors", async () => {
      const result = await executeQuery(
        "smartMenuSettings",
        QUERIES.smartMenuSettings
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.data?.db_widgetsList).toBeDefined();
      expect(result.data?.quarterlyMetrics).toBeDefined();
    });

    test("should return widgets list with pagination", async () => {
      const result = await executeQuery(
        "smartMenuSettings",
        QUERIES.smartMenuSettings
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();

      const { db_widgetsList } = result.data;
      expect(db_widgetsList).toBeDefined();
      expect(Array.isArray(db_widgetsList.items)).toBe(true);
      expect(db_widgetsList.pagination).toBeDefined();
      expect(typeof db_widgetsList.pagination.total).toBe("number");
    });

    test("should return widget items with required fields", async () => {
      const result = await executeQuery(
        "smartMenuSettings",
        QUERIES.smartMenuSettings
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();

      const { items } = result.data.db_widgetsList;
      expect(items.length).toBeGreaterThan(0);

      // Test first widget has required fields
      const firstWidget = items[0];
      expect(firstWidget.id).toBeDefined();
      expect(firstWidget.name).toBeDefined();
      expect(firstWidget.createdAt).toBeDefined();
      expect(firstWidget.updatedAt).toBeDefined();

      // Verify slug field is NOT present (as it was removed from datawarehouse schema)
      expect(firstWidget.slug).toBeUndefined();
    });

    test("should return quarterly metrics with proper structure", async () => {
      const result = await executeQuery(
        "smartMenuSettings",
        QUERIES.smartMenuSettings
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();

      const { quarterlyMetrics } = result.data;
      expect(Array.isArray(quarterlyMetrics)).toBe(true);
      expect(quarterlyMetrics.length).toBeGreaterThan(0);

      // Test first quarterly metric has required fields
      const firstMetric = quarterlyMetrics[0];
      expect(firstMetric.quarter).toBeDefined();
      expect(firstMetric.year).toBeDefined();
      expect(firstMetric.quarterLabel).toBeDefined();
      expect(firstMetric.orders).toBeDefined();
      expect(firstMetric.activeSmartMenus).toBeDefined();
      expect(firstMetric.locations).toBeDefined();

      // Validate metric structure
      expect(typeof firstMetric.orders.count).toBe("number");
      expect(typeof firstMetric.orders.qoqGrowth).toBe("number");
      expect(typeof firstMetric.orders.qoqGrowthPercent).toBe("number");
      expect(typeof firstMetric.activeSmartMenus.count).toBe("number");
      expect(typeof firstMetric.locations.count).toBe("number");
    });

    test("should not include chain_nra_classifications field that causes errors", async () => {
      const result = await executeQuery(
        "smartMenuSettings",
        QUERIES.smartMenuSettings
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();

      // The query should succeed without the problematic field
      const { items } = result.data.db_widgetsList;
      if (items.length > 0) {
        const firstWidget = items[0];
        // Verify that chain classification fields are present but don't cause errors
        expect(firstWidget.chain_nra_classifications).toBeDefined();
        expect(firstWidget.chain_menu_classifications).toBeDefined();
        expect(firstWidget.chain_cuisine_classifications).toBeDefined();
      }
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid queries gracefully", async () => {
      const result = await executeQuery("invalid", "{ invalidField }");

      expect(result.success).toBe(true);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("should handle malformed GraphQL", async () => {
      const result = await executeQuery(
        "malformed",
        "{ dashboardMetrics { invalid } }"
      );

      expect(result.success).toBe(true);
      expect(result.errors).toBeDefined();
    });
  });

  describe("Performance", () => {
    test("should respond within reasonable time", async () => {
      const startTime = Date.now();
      const result = await executeQuery(
        "performance",
        QUERIES.dashboardMetrics
      );
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
    });
  });
});
