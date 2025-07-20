const analyticsResolvers = {
  Query: {
    widgetAnalytics: async (_, { filters = {} }, { executeMetabaseQuery }) => {
      try {
        // Build the widget views query with filters
        const widgetViewsQuery = buildWidgetViewsQuery(filters);
        const repeatedVisitsQuery = buildRepeatedVisitsQuery(filters);
        const dailyInteractionsQuery = buildDailyInteractionsQuery(filters);

        // Execute queries in parallel
        const [viewsResult, repeatedResult, interactionsResult] =
          await Promise.all([
            executeMetabaseQuery(widgetViewsQuery),
            executeMetabaseQuery(repeatedVisitsQuery),
            executeMetabaseQuery(dailyInteractionsQuery),
          ]);

        // Calculate total visits and unique visitors from views result
        const totalVisits =
          viewsResult.data?.rows?.reduce(
            (sum, row) => sum + parseInt(row[0]),
            0
          ) || 0;
        const uniqueVisitors = viewsResult.data?.rows?.length || 0;
        const repeatedVisits = repeatedResult.data?.rows?.[0]?.[0] || 0;

        return {
          views: {
            totalVisits,
            uniqueVisitors,
            repeatedVisits,
          },
          dailyInteractions:
            interactionsResult.data?.rows?.map((row) => ({
              date: row[0],
              count: parseInt(row[1]),
            })) || [],
        };
      } catch (error) {
        console.error("Error in widgetAnalytics resolver:", error);
        throw new Error("Failed to fetch widget analytics");
      }
    },

    dailyInteractions: async (
      _,
      { filters = {} },
      { executeMetabaseQuery }
    ) => {
      try {
        const query = buildDailyInteractionsQuery(filters);
        const result = await executeMetabaseQuery(query);

        return (
          result.data?.rows?.map((row) => ({
            date: row[0],
            count: parseInt(row[1]),
          })) || []
        );
      } catch (error) {
        console.error("Error in dailyInteractions resolver:", error);
        throw new Error("Failed to fetch daily interactions");
      }
    },

    quarterlyMetrics: async (
      _,
      { startQuarter, endQuarter },
      { executeMetabaseQuery }
    ) => {
      try {
        console.log("🔍 quarterlyMetrics resolver called with args:", {
          startQuarter,
          endQuarter,
        });

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.quarterlyMetrics;

        console.log("📋 Original query:", query.native.query);

        // Modify query to use quarter filters if provided
        if (startQuarter || endQuarter) {
          let whereClause = `1 = 1`;

          if (startQuarter) {
            whereClause += ` AND date_trunc('quarter', event_time) >= '${startQuarter}'`;
          }
          if (endQuarter) {
            whereClause += ` AND date_trunc('quarter', event_time) <= '${endQuarter}'`;
          }

          console.log("🔧 Adding WHERE clause:", whereClause);

          // Add the WHERE clause to the quarterly_interactions CTE
          query.native.query = query.native.query.replace(
            `FROM everybite_analytics.widget_interactions`,
            `FROM everybite_analytics.widget_interactions WHERE ${whereClause}`
          );
        }

        console.log("🚀 Executing modified query:", query.native.query);
        console.log("📊 Query object:", JSON.stringify(query, null, 2));

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ Metabase query result:",
          JSON.stringify(result, null, 2)
        );
        console.log("📈 Raw rows count:", result.data?.rows?.length || 0);

        if (result.data?.rows) {
          console.log("📋 First few rows:", result.data.rows.slice(0, 3));
        }

        // Calculate quarter-over-quarter growth
        const rows = result.data?.rows || [];
        const mappedResult = rows.map((row, index) => {
          const currentQuarter = row[0];
          const currentOrders = parseInt(row[1]) || 0;
          const currentSmartMenus = parseInt(row[2]) || 0;
          const currentBrands = parseInt(row[3]) || 0;
          const currentLocations = parseInt(row[4]) || 0;

          // Get previous quarter data for growth calculation
          const previousRow = index < rows.length - 1 ? rows[index + 1] : null;
          const previousOrders = previousRow
            ? parseInt(previousRow[1]) || 0
            : 0;
          const previousSmartMenus = previousRow
            ? parseInt(previousRow[2]) || 0
            : 0;
          const previousBrands = previousRow
            ? parseInt(previousRow[3]) || 0
            : 0;
          const previousLocations = previousRow
            ? parseInt(previousRow[4]) || 0
            : 0;

          // Calculate growth
          const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
          };

          // Extract year and quarter from date
          const quarterDate = new Date(currentQuarter);
          const year = quarterDate.getFullYear();
          const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
          const quarterLabel = `Q${quarter} ${year}`;

          return {
            quarter: currentQuarter,
            year: year,
            quarterLabel: quarterLabel,
            brands: {
              count: currentBrands,
              qoqGrowth: currentBrands - previousBrands,
              qoqGrowthPercent: calculateGrowth(currentBrands, previousBrands),
            },
            locations: {
              count: currentLocations,
              qoqGrowth: currentLocations - previousLocations,
              qoqGrowthPercent: calculateGrowth(
                currentLocations,
                previousLocations
              ),
            },
            orders: {
              count: currentOrders,
              qoqGrowth: currentOrders - previousOrders,
              qoqGrowthPercent: calculateGrowth(currentOrders, previousOrders),
            },
            activeSmartMenus: {
              count: currentSmartMenus,
              qoqGrowth: currentSmartMenus - previousSmartMenus,
              qoqGrowthPercent: calculateGrowth(
                currentSmartMenus,
                previousSmartMenus
              ),
            },
            totalRevenue: {
              amount: 0, // TODO: Add revenue calculation when available
              qoqGrowth: 0,
              qoqGrowthPercent: 0,
            },
          };
        });

        console.log(
          "🎯 Final mapped result:",
          JSON.stringify(mappedResult, null, 2)
        );
        console.log("📊 Result count:", mappedResult.length);

        return mappedResult;
      } catch (error) {
        console.error("❌ Error in quarterlyMetrics resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch quarterly metrics");
      }
    },

    metabaseUsers: async (
      _,
      { page = 1, pageSize = 50 },
      { fetchMetabase }
    ) => {
      try {
        console.log("🔍 metabaseUsers resolver called with args:", {
          page,
          pageSize,
        });

        // Fetch Metabase users using the correct API endpoint
        const response = await fetchMetabase("/api/user");

        if (!response || !response.data) {
          throw new Error("Invalid response from Metabase API");
        }

        console.log("✅ Metabase users response:", {
          total: response.data.length,
          sampleUser: response.data[0],
        });

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = response.data.slice(startIndex, endIndex);

        return {
          users: paginatedUsers.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            name:
              user.common_name ||
              `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            dateJoined: user.date_joined,
            lastLogin: user.last_login,
            isActive: user.is_active,
            isSuperuser: user.is_superuser,
            isQbnewb: user.is_qbnewb,
            locale: user.locale,
            ssoSource: user.sso_source,
          })),
          total: response.data.length,
        };
      } catch (error) {
        console.error("❌ Error in metabaseUsers resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch Metabase users");
      }
    },

    dailyOrders: async (
      _,
      { startDate, endDate },
      { executeMetabaseQuery }
    ) => {
      try {
        console.log("🔍 dailyOrders resolver called with args:", {
          startDate,
          endDate,
        });

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.dailyOrdersTrend;

        console.log("📋 Original dailyOrders query:", query.native.query);

        // Modify query to use date filters if provided
        if (startDate || endDate) {
          let whereClause = `1 = 1`;

          if (startDate) {
            whereClause += ` AND "everybite_analytics"."widget_interactions"."event_time" >= CAST('${startDate}' AS timestamp)`;
          }
          if (endDate) {
            whereClause += ` AND "everybite_analytics"."widget_interactions"."event_time" <= CAST('${endDate}' AS timestamp)`;
          }

          console.log("🔧 Adding WHERE clause for dailyOrders:", whereClause);

          query.native.query = query.native.query.replace(
            `WHERE event_time >= current_date - INTERVAL '1 year'`,
            `WHERE ${whereClause}`
          );
        }

        console.log(
          "🚀 Executing modified dailyOrders query:",
          query.native.query
        );
        console.log(
          "📊 DailyOrders query object:",
          JSON.stringify(query, null, 2)
        );

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ DailyOrders Metabase query result:",
          JSON.stringify(result, null, 2)
        );
        console.log(
          "📈 DailyOrders raw rows count:",
          result.data?.rows?.length || 0
        );

        if (result.data?.rows) {
          console.log(
            "📋 DailyOrders first few rows:",
            result.data.rows.slice(0, 3)
          );
        }

        const mappedResult =
          result.data?.rows?.map((row) => ({
            date: row[0],
            count: parseInt(row[1]),
          })) || [];

        console.log(
          "🎯 DailyOrders final mapped result:",
          JSON.stringify(mappedResult, null, 2)
        );
        console.log("📊 DailyOrders result count:", mappedResult.length);

        return mappedResult;
      } catch (error) {
        console.error("❌ Error in dailyOrders resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch daily orders");
      }
    },

    dashboardMetrics: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 dashboardMetrics resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.dashboardMetrics;

        console.log("📋 Executing dashboardMetrics query:", query.native.query);

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ DashboardMetrics query result:",
          JSON.stringify(result, null, 2)
        );

        // Parse the simple result structure
        const row = result.data.rows[0];
        const totalWidgets = parseInt(row[0]) || 0;
        const activeWidgets = parseInt(row[1]) || 0;
        const totalLocations = parseInt(row[2]) || 0;
        const totalOrders = parseInt(row[3]) || 0;

        const widgetSummary = {
          totalWidgets,
          activeWidgets,
          totalLocations,
          totalOrders,
          averageOrdersPerWidget:
            totalWidgets > 0 ? totalOrders / totalWidgets : 0,
        };

        console.log("🎯 Processed dashboardMetrics:", {
          widgetSummary,
        });

        return {
          widgetSummary,
          quarterlyMetrics: [], // Use quarterlyTrends query for this data
          kpis: {
            totalRevenue: 0, // TODO: Add revenue calculation
            totalDinerVisits: 0,
            averageOrderValue: 0,
            conversionRate: 0,
          },
        };
      } catch (error) {
        console.error("❌ Error in dashboardMetrics resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch dashboard metrics");
      }
    },

    featureAdoption: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 featureAdoption resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.featureAdoption;

        console.log("📋 Executing featureAdoption query:", query.native.query);

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ FeatureAdoption query result:",
          JSON.stringify(result, null, 2)
        );

        if (!result.data?.rows || !result.data.rows[0]) {
          throw new Error("No data returned from featureAdoption query");
        }

        const row = result.data.rows[0];
        const totalActive = parseInt(row[0]) || 0;
        const withImages = parseInt(row[1]) || 0;
        const withCardLayout = parseInt(row[2]) || 0;
        const withOrdering = parseInt(row[3]) || 0;
        const withByo = parseInt(row[4]) || 0;

        console.log("🎯 Processed featureAdoption:", {
          totalActive,
          withImages,
          withCardLayout,
          withOrdering,
          withByo,
        });

        return {
          totalActive,
          withImages,
          withCardLayout,
          withOrdering,
          withByo,
        };
      } catch (error) {
        console.error("❌ Error in featureAdoption resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch feature adoption data");
      }
    },

    quarterlyTrends: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 quarterlyTrends resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.quarterlyTrends;

        console.log("📋 Executing quarterlyTrends query:", query.native.query);

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ QuarterlyTrends query result:",
          JSON.stringify(result, null, 2)
        );

        if (!result.data?.rows) {
          throw new Error("No data returned from quarterlyTrends query");
        }

        const trends = result.data.rows
          .map((row) => {
            const quarter = row[0];
            const totalOrders = parseInt(row[1]) || 0;
            const activeWidgets = parseInt(row[2]) || 0;
            const newWidgets = parseInt(row[3]) || 0;
            const newBrands = parseInt(row[4]) || 0;
            const newLocations = parseInt(row[5]) || 0;

            if (quarter) {
              const quarterDate = new Date(quarter);
              const year = quarterDate.getFullYear();
              const quarterNum = Math.floor(quarterDate.getMonth() / 3) + 1;
              const quarterLabel = `Q${quarterNum} ${year}`;

              return {
                quarter,
                year,
                quarterLabel,
                totalOrders,
                activeWidgets,
                newWidgets,
                newBrands,
                newLocations,
              };
            }
            return null;
          })
          .filter(Boolean);

        console.log("🎯 Processed quarterlyTrends:", {
          trendsCount: trends.length,
        });

        return trends;
      } catch (error) {
        console.error("❌ Error in quarterlyTrends resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch quarterly trends data");
      }
    },

    monthlyGrowth: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 monthlyGrowth resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.monthlyGrowth;

        console.log("📋 Executing monthlyGrowth query:", query.native.query);

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ MonthlyGrowth query result:",
          JSON.stringify(result, null, 2)
        );

        if (!result.data?.rows) {
          throw new Error("No data returned from monthlyGrowth query");
        }

        const growth = result.data.rows
          .map((row) => {
            const month = row[0];
            const totalOrders = parseInt(row[1]) || 0;
            const activeWidgets = parseInt(row[2]) || 0;
            const newWidgets = parseInt(row[3]) || 0;
            const newBrands = parseInt(row[4]) || 0;

            if (month) {
              const monthDate = new Date(month);
              const year = monthDate.getFullYear();
              const monthNum = monthDate.getMonth() + 1;
              const monthLabel = monthDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });

              return {
                month,
                year,
                monthNum,
                monthLabel,
                totalOrders,
                activeWidgets,
                newWidgets,
                newBrands,
              };
            }
            return null;
          })
          .filter(Boolean);

        console.log("🎯 Processed monthlyGrowth:", {
          growthCount: growth.length,
        });

        return growth;
      } catch (error) {
        console.error("❌ Error in monthlyGrowth resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch monthly growth data");
      }
    },

    dailyOrdersTrends: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 dailyOrdersTrends resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.dailyOrdersTrends;

        console.log(
          "📋 Executing dailyOrdersTrends query:",
          query.native.query
        );

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ DailyOrdersTrends query result:",
          JSON.stringify(result, null, 2)
        );

        if (!result.data?.rows) {
          throw new Error("No data returned from dailyOrdersTrends query");
        }

        const trends = result.data.rows
          .map((row) => {
            const day = row[0];
            const totalOrders = parseInt(row[1]) || 0;
            const activeWidgets = parseInt(row[2]) || 0;
            const uniqueUsers = parseInt(row[3]) || 0;

            if (day) {
              const dayDate = new Date(day);
              const dayLabel = dayDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return {
                day,
                dayLabel,
                totalOrders,
                activeWidgets,
                uniqueUsers,
              };
            }
            return null;
          })
          .filter(Boolean);

        console.log("🎯 Processed dailyOrdersTrends:", {
          trendsCount: trends.length,
        });

        return trends;
      } catch (error) {
        console.error("❌ Error in dailyOrdersTrends resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch daily orders trends data");
      }
    },

    activationInsights: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 activationInsights resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.activationInsights;

        console.log(
          "📋 Executing activationInsights query:",
          query.native.query
        );

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ ActivationInsights query result:",
          JSON.stringify(result, null, 2)
        );

        if (!result.data?.rows) {
          throw new Error("No data returned from activationInsights query");
        }

        const activationStats = [];
        const recentActivations = [];

        result.data.rows.forEach((row) => {
          const dataType = row[0];

          if (dataType === "activation_stats") {
            const status = row[1];
            const count = parseInt(row[2]) || 0;
            const avgLocations = parseFloat(row[3]) || 0;

            activationStats.push({
              status,
              count,
              avgLocations,
            });
          } else if (dataType === "recent_activations") {
            const week = row[1];
            const activations = parseInt(row[2]) || 0;

            if (week) {
              const weekDate = new Date(week);
              const weekLabel = weekDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              recentActivations.push({
                week,
                weekLabel,
                activations,
              });
            }
          }
        });

        console.log("🎯 Processed activationInsights:", {
          activationStatsCount: activationStats.length,
          recentActivationsCount: recentActivations.length,
        });

        return {
          activationStats,
          recentActivations,
        };
      } catch (error) {
        console.error("❌ Error in activationInsights resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch activation insights data");
      }
    },

    retentionAnalytics: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 retentionAnalytics resolver called");

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.retentionAnalytics;

        console.log(
          "📋 Executing retentionAnalytics query:",
          query.native.query
        );

        const result = await executeMetabaseQuery(query);

        console.log(
          "✅ RetentionAnalytics query result:",
          JSON.stringify(result, null, 2)
        );

        if (!result.data?.rows) {
          throw new Error("No data returned from retentionAnalytics query");
        }

        const retention = result.data.rows
          .map((row) => {
            const cohortMonth = row[0];
            const cohortSize = parseInt(row[1]) || 0;
            const firstTimeUsers = parseInt(row[2]) || 0;
            const returningUsers = parseInt(row[3]) || 0;
            const retentionRate = parseFloat(row[4]) || 0;

            if (cohortMonth) {
              const monthDate = new Date(cohortMonth);
              const monthLabel = monthDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });

              return {
                cohortMonth,
                monthLabel,
                cohortSize,
                firstTimeUsers,
                returningUsers,
                retentionRate,
              };
            }
            return null;
          })
          .filter(Boolean);

        console.log("🎯 Processed retentionAnalytics:", {
          retentionCount: retention.length,
        });

        return retention;
      } catch (error) {
        console.error("❌ Error in retentionAnalytics resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch retention analytics data");
      }
    },

    totalMetrics: async (
      _,
      { startDate, endDate },
      { executeMetabaseQuery }
    ) => {
      try {
        console.log("🔍 totalMetrics resolver called with args:", {
          startDate,
          endDate,
        });

        const analyticsQueries = require("../queries/analytics");
        const query = analyticsQueries.totalMetrics;

        console.log("📋 Original totalMetrics query:", query.native.query);

        // Replace template variables with actual dates
        let modifiedQuery = query.native.query
          .replace("{{startDate}}", startDate)
          .replace("{{endDate}}", endDate);

        console.log("🔧 Modified totalMetrics query:", modifiedQuery);

        const queryToExecute = {
          ...query,
          native: {
            ...query.native,
            query: modifiedQuery,
          },
        };

        console.log(
          "🚀 Executing totalMetrics query:",
          JSON.stringify(queryToExecute, null, 2)
        );

        const result = await executeMetabaseQuery(queryToExecute);

        console.log(
          "✅ TotalMetrics Metabase query result:",
          JSON.stringify(result, null, 2)
        );
        console.log(
          "📈 TotalMetrics raw rows count:",
          result.data?.rows?.length || 0
        );

        if (result.data?.rows) {
          console.log("📋 TotalMetrics rows:", result.data.rows);
        }

        const row = result.data?.rows?.[0];
        const mappedResult = {
          totalOrders: parseInt(row?.[0]) || 0,
          totalDinerVisits: parseInt(row?.[1]) || 0,
          startDate,
          endDate,
        };

        console.log(
          "🎯 TotalMetrics final mapped result:",
          JSON.stringify(mappedResult, null, 2)
        );

        return mappedResult;
      } catch (error) {
        console.error("❌ Error in totalMetrics resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch total metrics");
      }
    },

    schemaExploration: async (_, __, { executeMetabaseQuery }) => {
      try {
        console.log("🔍 schemaExploration resolver called");

        const analyticsQueries = require("../queries/analytics");

        // Execute all schema exploration queries in parallel
        const [
          tablesResult,
          widgetInteractionsColumnsResult,
          dbWidgetsColumnsResult,
          widgetInteractionsSampleResult,
          dbWidgetsSampleResult,
        ] = await Promise.all([
          executeMetabaseQuery(analyticsQueries.listTables),
          executeMetabaseQuery(analyticsQueries.describeWidgetInteractions),
          executeMetabaseQuery(analyticsQueries.describeDbWidgets),
          executeMetabaseQuery(analyticsQueries.sampleWidgetInteractions),
          executeMetabaseQuery(analyticsQueries.sampleDbWidgets),
        ]);

        console.log("✅ Schema exploration results received");

        // Parse tables
        const tables =
          tablesResult.data?.rows?.map((row) => ({
            tableName: row[0],
          })) || [];

        // Parse widget_interactions columns
        const widgetInteractionsColumns =
          widgetInteractionsColumnsResult.data?.rows?.map((row) => ({
            columnName: row[0],
            dataType: row[1],
            comment: row[2] || null,
          })) || [];

        // Parse db_widgets columns
        const dbWidgetsColumns =
          dbWidgetsColumnsResult.data?.rows?.map((row) => ({
            columnName: row[0],
            dataType: row[1],
            comment: row[2] || null,
          })) || [];

        // Parse sample data
        const widgetInteractionsSample =
          widgetInteractionsSampleResult.data?.rows?.map((row) => ({
            values: row.map((val) => String(val || "")),
          })) || [];

        const dbWidgetsSample =
          dbWidgetsSampleResult.data?.rows?.map((row) => ({
            values: row.map((val) => String(val || "")),
          })) || [];

        const result = {
          tables,
          widgetInteractionsColumns,
          dbWidgetsColumns,
          widgetInteractionsSample,
          dbWidgetsSample,
        };

        console.log(
          "🎯 Schema exploration result:",
          JSON.stringify(result, null, 2)
        );

        return result;
      } catch (error) {
        console.error("❌ Error in schemaExploration resolver:", error);
        console.error("❌ Error stack:", error.stack);
        throw new Error("Failed to fetch schema exploration data");
      }
    },
    info: () => ({
      version: process.env.LAMBDA_VERSION || "unknown",
      gitCommit: process.env.GIT_COMMIT || "unknown",
      deployTimestamp: process.env.DEPLOY_TIMESTAMP || "unknown",
      environment: process.env.ENVIRONMENT || process.env.NODE_ENV || "unknown",
      region:
        process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "unknown",
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || "unknown",
      nodeVersion: process.version,
      memoryLimitInMB: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || "unknown",
      apiKeySet: Boolean(process.env.API_KEY),
    }),

    // Enhanced schema exploration resolvers
    tableMetadata: async (_, { tableName }, { executeMetabaseQuery }) => {
      try {
        console.log(`🔍 tableMetadata resolver called for table: ${tableName}`);

        // Get table schema information
        const describeQuery = {
          database: 2,
          type: "native",
          native: {
            query: `DESCRIBE everybite_analytics.${tableName}`,
          },
        };

        // Get row count
        const countQuery = {
          database: 2,
          type: "native",
          native: {
            query: `SELECT COUNT(*) as row_count FROM everybite_analytics.${tableName}`,
          },
        };

        const [describeResult, countResult] = await Promise.all([
          executeMetabaseQuery(describeQuery),
          executeMetabaseQuery(countQuery),
        ]);

        // Parse column metadata
        const columns =
          describeResult.data?.rows?.map((row) => ({
            name: row[0],
            dataType: row[1],
            isNullable: row[2] === "YES",
            comment: row[3] || null,
            isPrimaryKey: row[4] === "PRI",
            isForeignKey: row[4] === "MUL",
          })) || [];

        // Parse row count
        const rowCount = countResult.data?.rows?.[0]?.[0] || 0;

        // For now, return empty relationships (we'll enhance this later)
        const relationships = [];

        console.log(`✅ Table metadata for ${tableName}:`, {
          columns: columns.length,
          rowCount,
          relationships: relationships.length,
        });

        return {
          columns,
          rowCount,
          relationships,
        };
      } catch (error) {
        console.error(
          `❌ Error in tableMetadata resolver for ${tableName}:`,
          error
        );
        throw new Error(`Failed to fetch metadata for table ${tableName}`);
      }
    },

    dataVolume: async (_, { tableName }, { executeMetabaseQuery }) => {
      try {
        console.log(`🔍 dataVolume resolver called for table: ${tableName}`);

        const query = {
          database: 2,
          type: "native",
          native: {
            query: `
              SELECT 
                COUNT(*) as row_count,
                'Unknown' as estimated_size,
                CURRENT_TIMESTAMP as last_updated
              FROM everybite_analytics.${tableName}
            `,
          },
        };

        const result = await executeMetabaseQuery(query);
        const row = result.data?.rows?.[0];

        if (!row) {
          throw new Error(`No data found for table ${tableName}`);
        }

        const dataVolume = {
          rowCount: parseInt(row[0]),
          estimatedSize: row[1],
          lastUpdated: row[2],
        };

        console.log(`✅ Data volume for ${tableName}:`, dataVolume);

        return dataVolume;
      } catch (error) {
        console.error(
          `❌ Error in dataVolume resolver for ${tableName}:`,
          error
        );
        throw new Error(`Failed to fetch data volume for table ${tableName}`);
      }
    },

    tableRelationships: async (_, { tableName }, { executeMetabaseQuery }) => {
      try {
        console.log(
          `🔍 tableRelationships resolver called for table: ${tableName}`
        );

        // For now, return empty relationships (we'll enhance this with actual foreign key detection later)
        const relationships = {
          foreignKeys: [],
          referencedBy: [],
        };

        console.log(`✅ Table relationships for ${tableName}:`, relationships);

        return relationships;
      } catch (error) {
        console.error(
          `❌ Error in tableRelationships resolver for ${tableName}:`,
          error
        );
        throw new Error(`Failed to fetch relationships for table ${tableName}`);
      }
    },

    sampleData: async (
      _,
      { tableName, limit = 10 },
      { executeMetabaseQuery }
    ) => {
      try {
        console.log(
          `🔍 sampleData resolver called for table: ${tableName}, limit: ${limit}`
        );

        const query = {
          database: 2,
          type: "native",
          native: {
            query: `SELECT * FROM everybite_analytics.${tableName} LIMIT ${limit}`,
          },
        };

        const result = await executeMetabaseQuery(query);

        if (!result.data?.rows || result.data.rows.length === 0) {
          return {
            columns: [],
            rows: [],
          };
        }

        // Get column names from the first row structure
        const columns = result.data.cols?.map((col) => col.name) || [];
        const rows = result.data.rows.map((row) =>
          row.map((val) => String(val || ""))
        );

        console.log(`✅ Sample data for ${tableName}:`, {
          columns: columns.length,
          rows: rows.length,
        });

        return {
          columns,
          rows,
        };
      } catch (error) {
        console.error(
          `❌ Error in sampleData resolver for ${tableName}:`,
          error
        );
        throw new Error(`Failed to fetch sample data for table ${tableName}`);
      }
    },
  },
};

// Helper functions to build queries with filters
function buildWidgetViewsQuery(filters) {
  let whereClause = "1 = 1";

  if (filters.dateRange) {
    whereClause += ` AND ${filters.dateRange}`;
  }
  if (filters.contextPageUrl) {
    whereClause += ` AND referrer = '${filters.contextPageUrl}'`;
  }
  if (filters.restaurantName) {
    whereClause += ` AND widgets.name = '${filters.restaurantName}'`;
  }
  if (filters.widgetId) {
    whereClause += ` AND widget_views.widget_id = '${filters.widgetId}'`;
  }

  return {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH widget_views AS (
          SELECT *
          FROM everybite_analytics.widget_viewed
          WHERE ${whereClause}
        ), widgets AS (
          SELECT * FROM everybite_analytics.db_widgets
        ), results AS (
          SELECT *
          FROM widget_views
          LEFT JOIN widgets ON widget_views.widget_id = widgets.id
        )
        SELECT 
          count(distinct distinct_session_id) as total_visits,
          date_trunc('day', event_time) as day
        FROM results
        GROUP BY date_trunc('day', event_time)
      `,
    },
  };
}

function buildRepeatedVisitsQuery(filters) {
  let whereClause = "1 = 1";

  if (filters.dateRange) {
    whereClause += ` AND ${filters.dateRange}`;
  }
  if (filters.contextPageUrl) {
    whereClause += ` AND referrer = '${filters.contextPageUrl}'`;
  }
  if (filters.restaurantName) {
    whereClause += ` AND widgets.name = '${filters.restaurantName}'`;
  }
  if (filters.widgetId) {
    whereClause += ` AND widget_views.widget_id = '${filters.widgetId}'`;
  }

  return {
    database: 2,
    type: "native",
    native: {
      query: `
        WITH widget_views AS (
          SELECT *
          FROM everybite_analytics.widget_viewed
          WHERE ${whereClause}
        ), widgets AS (
          SELECT * FROM everybite_analytics.db_widgets
        ), extended_views AS (
          SELECT *
          FROM widget_views
          LEFT JOIN widgets ON widget_views.widget_id = widgets.id
        ), results AS (
          SELECT
            count(distinct distinct_session_id) as session_count,
            amplitude_id
          FROM extended_views
          GROUP BY amplitude_id
        )
        SELECT 
          count(*) as total_repeated_visits
        FROM results
        WHERE session_count > 1
      `,
    },
  };
}

function buildDailyInteractionsQuery(filters) {
  let whereClause = "1 = 1";

  if (filters.dateRange) {
    whereClause += ` AND ${filters.dateRange}`;
  }
  if (filters.restaurantName) {
    whereClause += ` AND widgets.name = '${filters.restaurantName}'`;
  }
  if (filters.widgetId) {
    whereClause += ` AND widget_interactions.widget_id = '${filters.widgetId}'`;
  }

  return {
    database: 2,
    type: "native",
    native: {
      query: `
        SELECT
          DATE_TRUNC('day', "everybite_analytics"."widget_interactions"."event_time") AS "event_time",
          COUNT(*) AS "count"
        FROM "everybite_analytics"."widget_interactions"
        ${filters.restaurantName ? "LEFT JOIN everybite_analytics.db_widgets widgets ON widget_interactions.widget_id = widgets.id" : ""}
        WHERE ${whereClause}
        GROUP BY DATE_TRUNC('day', "everybite_analytics"."widget_interactions"."event_time")
        ORDER BY DATE_TRUNC('day', "everybite_analytics"."widget_interactions"."event_time") ASC
      `,
    },
  };
}

module.exports = analyticsResolvers;
