import { gql } from "@apollo/client";

// Widget Analytics Query
export const WIDGET_ANALYTICS_QUERY = gql`
  query WidgetAnalytics($filters: WidgetAnalyticsFilters) {
    widgetAnalytics(filters: $filters) {
      totalWidgets
      activeWidgets
      totalBrands
      totalLocations
      widgetsByQuarter {
        quarter
        count
        brands
        locations
      }
    }
  }
`;

// Daily Interactions Query
export const DAILY_INTERACTIONS_QUERY = gql`
  query DailyInteractions($filters: DailyInteractionsFilters) {
    dailyInteractions(filters: $filters) {
      date
      interactions
      uniqueUsers
      widgetId
    }
  }
`;

// Combined Quarterly Metrics Query
export const QUARTERLY_METRICS_QUERY = gql`
  query QuarterlyMetrics($filters: QuarterlyMetricsFilters) {
    quarterlyMetrics(filters: $filters) {
      quarter
      orders
      brands
      locations
      activeSmartMenus
    }
  }
`;

// Types for the queries
export interface WidgetAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  widgetId?: string;
  brandId?: string;
}

export interface DailyInteractionsFilters {
  startDate?: string;
  endDate?: string;
  widgetId?: string;
  limit?: number;
}

export interface QuarterlyMetricsFilters {
  startQuarter?: string;
  endQuarter?: string;
  brandId?: string;
}

export interface WidgetAnalyticsData {
  totalWidgets: number;
  activeWidgets: number;
  totalBrands: number;
  totalLocations: number;
  widgetsByQuarter: Array<{
    quarter: string;
    count: number;
    brands: number;
    locations: number;
  }>;
}

export interface DailyInteractionsData {
  date: string;
  interactions: number;
  uniqueUsers: number;
  widgetId: string;
}

export interface QuarterlyMetricsData {
  quarter: string;
  orders: number;
  brands: number;
  locations: number;
  activeSmartMenus: number;
}
