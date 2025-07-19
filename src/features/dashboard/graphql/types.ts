// Common widget interface for both API and Lambda
export interface DashboardWidget {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  numberOfLocations?: number | null;
}

// Player analytics widget interface
export interface PlayerAnalyticsWidget {
  id: string;
  publishedAt?: string | null;
  displayImages: boolean;
  layout?: string | null;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;
}

// Lambda response interfaces
export interface LambdaWidgetsResponse {
  db_widgetsList: {
    items: DashboardWidget[];
    pagination: {
      total: number;
    };
  };
}

export interface LambdaPlayerAnalyticsResponse {
  db_widgetsList: {
    items: PlayerAnalyticsWidget[];
  };
}

// API response interfaces
export interface ApiWidgetsResponse {
  widgets: DashboardWidget[];
}

export interface ApiPlayerAnalyticsResponse {
  widgets: PlayerAnalyticsWidget[];
}

// Quarterly metrics interfaces
export interface MetricWithGrowth {
  count: number;
  qoqGrowth: number;
  qoqGrowthPercent: number;
}

export interface QuarterlyMetricsData {
  quarter: string;
  year: number;
  quarterLabel: string;
  orders: MetricWithGrowth;
  locations: MetricWithGrowth;
  activeSmartMenus: MetricWithGrowth;
  brands: MetricWithGrowth;
  totalRevenue: MetricWithGrowth;
}

export interface QuarterlyMetricsResponse {
  quarterlyMetrics: QuarterlyMetricsData[];
}

// Dashboard metrics interface
export interface DashboardMetrics {
  total: number;
  active: number;
  totalLocations: number;
  totalDelta: string;
  activeDelta: string;
  locationsDelta: string;
}

// Player analytics interface
export interface PlayerAnalytics {
  totalActive: number;
  withImages: number;
  withCardLayout: number;
  withOrdering: number;
  withByo: number;
}
