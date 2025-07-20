import { gql } from "@apollo/client";

/**
 * Widget quarterly trends
 * Returns quarterly trend analysis for widgets
 * Domain: WIDGETS, MetricType: TRENDS, Granularity: QUARTERLY
 */
export const WIDGETS_QUARTERLY_TRENDS = gql`
  query GetWidgetQuarterlyTrends {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
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

/**
 * Widget monthly growth
 * Returns monthly growth analysis
 * Domain: WIDGETS, MetricType: GROWTH, Granularity: MONTHLY
 */
export const WIDGETS_MONTHLY_GROWTH = gql`
  query GetWidgetMonthlyGrowth {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        numberOfLocations
      }
    }
  }
`;

/**
 * Orders daily trends
 * Returns daily order trend analysis
 * Domain: ORDERS, MetricType: TRENDS, Granularity: DAILY
 */
export const ORDERS_DAILY_TRENDS = gql`
  query GetOrdersDailyTrends {
    dailyOrders {
      date
      count
      growth
      growthPercent
    }
  }
`;
