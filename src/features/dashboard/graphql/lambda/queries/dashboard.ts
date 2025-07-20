import { gql } from "@apollo/client";

/**
 * Core dashboard widget metrics query
 * Returns essential metrics for the main dashboard view
 * Domain: WIDGETS, MetricType: DASHBOARD, Granularity: METRICS
 */
export const DASHBOARD_WIDGET_METRICS = gql`
  query GetDashboardWidgetMetrics {
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

/**
 * Dashboard order metrics query
 * Returns order-related metrics for dashboard
 * Domain: ORDERS, MetricType: DASHBOARD, Granularity: METRICS
 */
export const DASHBOARD_ORDER_METRICS = gql`
  query GetDashboardOrderMetrics {
    quarterlyMetrics {
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;

/**
 * Dashboard location metrics query
 * Returns location-related metrics for dashboard
 * Domain: LOCATIONS, MetricType: DASHBOARD, Granularity: METRICS
 */
export const DASHBOARD_LOCATION_METRICS = gql`
  query GetDashboardLocationMetrics {
    db_widgetsList {
      items {
        id
        publishedAt
        numberOfLocations
      }
    }
  }
`;
