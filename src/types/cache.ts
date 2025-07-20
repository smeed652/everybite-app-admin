export interface CacheStatus {
  operation: string;
  age: number;
  isStale: boolean;
  notCached?: boolean;
  ttl?: number; // TTL in minutes
}

export interface CacheStatusResponse {
  enabled: boolean;
  message?: string;
  data?: CacheStatus[];
}

export interface ScheduledRefreshInfo {
  enabled: boolean;
  scheduled?: boolean;
  message?: string;
  nextRefresh?: string;
  nextRefreshLocal?: string;
  timezone?: string;
  scheduledTime?: string;
}

// Service-level cache status (new)
export interface OperationCacheStatus {
  exists: boolean;
  operationName: string;
  age?: number; // minutes
  ttl?: number; // minutes
  isExpired?: boolean;
  expiresIn?: number; // minutes until expiry
  error?: Error;
}

export interface CacheConfig {
  enableCaching: boolean;
  scheduledRefreshEnabled: boolean;
  scheduledRefreshTime: string;
  scheduledRefreshTimezone: string;
  cacheTTLHours: number;
  // Operation-level TTLs for different operations
  operationTTLs: {
    [operationName: string]: number;
  };
}

export interface CacheOperation {
  operation: string;
  displayName?: string; // Operation-focused display name
  age?: number;
  isStale?: boolean;
  isCached: boolean;
  ttl?: number; // TTL in minutes
}

// Service groups for organization
export interface ServiceGroup {
  name: string;
  operations: string[];
  displayName: string;
}

// New types for grouped analytics queries
export interface DashboardMetrics {
  quarterlyMetrics: QuarterlyMetricsData[];
  widgetSummary: WidgetSummaryData;
  kpis: KPIData;
}

export interface WidgetSummaryData {
  totalWidgets: number;
  activeWidgets: number;
  totalLocations: number;
  totalOrders: number;
  averageOrdersPerWidget: number;
}

export interface KPIData {
  totalRevenue: number;
  totalDinerVisits: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface DetailedAnalytics {
  dailyInteractions: DailyInteractionData[];
  detailedWidgetAnalytics: DetailedWidgetAnalyticsData[];
  trends: TrendsData;
}

export interface DetailedWidgetAnalyticsData {
  widgetId: string;
  widgetName: string;
  totalVisits: number;
  uniqueVisitors: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}

export interface TrendsData {
  dailyOrders: DailyOrderData[];
  weeklyGrowth: number;
  monthlyGrowth: number;
}

// Legacy types for backward compatibility
export interface QuarterlyMetricsData {
  quarter: string;
  year: number;
  quarterLabel: string;
  brands: MetricWithGrowth;
  locations: MetricWithGrowth;
  orders: MetricWithGrowth;
  activeSmartMenus: MetricWithGrowth;
  totalRevenue?: RevenueMetric;
}

export interface MetricWithGrowth {
  count: number;
  qoqGrowth: number;
  qoqGrowthPercent: number;
}

export interface RevenueMetric {
  amount: number;
  qoqGrowth: number;
  qoqGrowthPercent: number;
}

export interface DailyInteractionData {
  date: string;
  count: number;
}

export interface DailyOrderData {
  date: string;
  count: number;
}

export interface WidgetAnalyticsData {
  views: WidgetViewMetrics;
  dailyInteractions: DailyInteractionData[];
}

export interface WidgetViewMetrics {
  totalVisits: number;
  uniqueVisitors: number;
  repeatedVisits: number;
}
