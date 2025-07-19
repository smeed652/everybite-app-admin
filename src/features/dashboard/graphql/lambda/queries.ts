import { gql } from "@apollo/client";

// Dashboard widgets query (from Lambda)
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
