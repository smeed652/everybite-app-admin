// Comprehensive SmartMenu settings query (combines dashboard + analytics)
export * from "./smartmenu-settings";

// Dashboard queries - Core dashboard metrics (real-time)
export * from "./dashboard";

// Analytics queries - Detailed analytics (feature usage, performance)
export * from "./analytics";

// Trend queries - Time-based analysis (quarterly, monthly, daily)
export * from "./trends";

// Insight queries - Business intelligence (activation, retention, predictive)
export * from "./insights";

// Legacy queries (for backward compatibility during transition)
export {
  LAMBDA_GET_DASHBOARD_WIDGETS,
  LAMBDA_GET_PLAYER_ANALYTICS,
  LAMBDA_GET_QUARTERLY_METRICS,
  LAMBDA_GET_WIDGETS_WITH_ANALYTICS,
} from "../queries";
