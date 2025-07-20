import { ApolloClient } from "@apollo/client";
import { QuarterlyMetricsData, WidgetAnalyticsData } from "./cache";

// Service result type for consistent error handling
export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

// Base service interface
export interface BaseService {
  client: ApolloClient<unknown>;
}

// Dashboard data types
export interface DashboardData {
  quarterly: QuarterlyMetricsData | null;
  widgets: WidgetAnalyticsData | null;
  analytics: unknown | null; // Will define proper type later
}

// SmartMenus data types
export interface SmartMenusData {
  smartMenus: SmartMenu[];
  totalCount: number;
}

export interface SmartMenu {
  id: string;
  name: string;
  // Add other fields as needed
}
