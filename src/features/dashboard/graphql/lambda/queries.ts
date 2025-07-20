import { gql } from "@apollo/client";

// Dashboard metrics query (from Lambda) - returns calculated metrics directly
// TODO: Replace with proper backend dashboard metrics query when Lambda supports it
export const LAMBDA_GET_DASHBOARD_METRICS = gql /* GraphQL */ `
  query GetDashboardMetrics {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        numberOfLocations
      }
      pagination {
        total
      }
    }
  }
`;

// Future: Proper dashboard metrics query (when Lambda supports it)
// export const LAMBDA_GET_DASHBOARD_METRICS = gql /* GraphQL */ `
//   query GetDashboardMetrics {
//     dashboardMetrics {
//       widgetSummary {
//         totalWidgets
//         activeWidgets
//         totalLocations
//         totalOrders
//         averageOrdersPerWidget
//       }
//       trends {
//         totalDelta
//         activeDelta
//         locationsDelta
//       }
//     }
//   }
// `;

// Legacy dashboard widgets query (keeping for backward compatibility)
export const LAMBDA_GET_DASHBOARD_WIDGETS = gql /* GraphQL */ `
  query GetDashboardWidgets {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        numberOfLocations
      }
      pagination {
        total
      }
    }
  }
`;

// Player analytics query (from Lambda)
export const LAMBDA_GET_PLAYER_ANALYTICS = gql`
  query GetPlayerAnalytics {
    db_widgetsList {
      items {
        id
        publishedAt
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled
      }
    }
  }
`;

// Combined widgets query with all fields (for analytics)
export const LAMBDA_GET_WIDGETS_WITH_ANALYTICS = gql`
  query GetWidgetsWithAnalytics {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        numberOfLocations
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled
      }
      pagination {
        total
      }
    }
  }
`;

// Quarterly metrics query (from Lambda) - already exists but moving here for consistency
export const LAMBDA_GET_QUARTERLY_METRICS = gql`
  query GetQuarterlyMetrics {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      locations {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      brands {
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
  }
`;
