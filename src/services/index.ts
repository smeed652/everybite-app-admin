// Base services
export {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "./base/DataService";
export { lambdaService } from "./base/lambdaService";

// Domain-specific services
export { AnalyticsService } from "./analytics/AnalyticsService";
export { DashboardService } from "./dashboard/DashboardService";
export { InsightsService } from "./insights/InsightsService";
export { SmartMenuSettingsService } from "./smartmenus/SmartMenuSettingsService";
export { TrendsService } from "./trends/TrendsService";
export { WidgetAnalyticsService } from "./widgets/WidgetAnalyticsService";

// Service types
export type {
  // Widget Analytics
  WidgetAnalytics,
  WidgetDashboard,
  WidgetFilters,
  WidgetMetrics,
  WidgetTrends,
} from "./widgets/WidgetAnalyticsService";

export type {
  DashboardFilters,
  DashboardLocationMetrics,
  DashboardMetrics,
  DashboardOrderMetrics,
  // Dashboard
  DashboardWidgetMetrics,
} from "./dashboard/DashboardService";

export type {
  AnalyticsFilters,
  FeatureAdoptionMetrics,
  OrdersAnalytics,
  PerformanceMetrics,
  // Analytics
  WidgetFeatureAdoption,
  WidgetPerformanceMetrics,
} from "./analytics/AnalyticsService";

export type {
  DailyOrdersMetrics,
  MonthlyGrowthMetrics,
  OrdersDailyTrends,
  QuarterlyTrendsMetrics,
  TrendsFilters,
  WidgetMonthlyGrowth,
  // Trends
  WidgetQuarterlyTrends,
} from "./trends/TrendsService";

export type {
  ActivationInsightsMetrics,
  InsightsFilters,
  PredictiveInsights,
  PredictiveInsightsMetrics,
  RetentionAnalyticsMetrics,
  // Insights
  WidgetActivationInsights,
  WidgetRetentionAnalytics,
} from "./insights/InsightsService";

export type {
  QuarterlyMetrics,
  // SmartMenu Settings
  SmartMenuSettings,
  SmartMenuSettingsFilters,
  SmartMenuSettingsMetrics,
} from "./smartmenus/SmartMenuSettingsService";
