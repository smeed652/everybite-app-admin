import { gql } from "@apollo/client";

/**
 * Widget feature adoption analytics
 * Returns detailed feature usage statistics
 * Domain: WIDGETS, MetricType: FEATURE, Granularity: ADOPTION
 */
export const WIDGETS_FEATURE_ADOPTION = gql`
  query GetWidgetFeatureAdoption {
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

/**
 * Widget performance metrics
 * Returns performance-related analytics
 * Domain: WIDGETS, MetricType: PERFORMANCE, Granularity: METRICS
 */
export const WIDGETS_PERFORMANCE_METRICS = gql`
  query GetWidgetPerformanceMetrics {
    db_widgetsList {
      items {
        id
        publishedAt
        numberOfLocations
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * Order analytics
 * Returns detailed order analysis
 * Domain: ORDERS, MetricType: ANALYTICS, Granularity: DETAILED
 */
export const ORDERS_ANALYTICS = gql`
  query GetOrdersAnalytics {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;
