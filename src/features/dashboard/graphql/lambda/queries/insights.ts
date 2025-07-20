import { gql } from "@apollo/client";

/**
 * Widget activation insights
 * Returns activation pattern analysis
 * Domain: WIDGETS, MetricType: INSIGHTS, Granularity: ACTIVATION
 */
export const WIDGETS_ACTIVATION_INSIGHTS = gql`
  query GetWidgetActivationInsights {
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
 * Widget retention analytics
 * Returns retention analysis
 * Domain: WIDGETS, MetricType: RETENTION, Granularity: ANALYTICS
 */
export const WIDGETS_RETENTION_ANALYTICS = gql`
  query GetWidgetRetentionAnalytics {
    db_widgetsList {
      items {
        id
        createdAt
        publishedAt
        updatedAt
        numberOfLocations
      }
    }
  }
`;

/**
 * Predictive insights
 * Returns predictive analytics data
 * Domain: PREDICTIVE, MetricType: INSIGHTS, Granularity: FORECAST
 */
export const PREDICTIVE_INSIGHTS = gql`
  query GetPredictiveInsights {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;
