# Analytics Query Organization

## Overview

This document describes the organization and naming conventions for analytics queries in the dashboard system.

## File Structure

```
src/features/dashboard/graphql/lambda/queries/
├── dashboard.ts          # Core dashboard metrics (real-time)
├── analytics.ts          # Detailed analytics (feature usage, performance)
├── trends.ts            # Time-based analysis (quarterly, monthly, daily)
├── insights.ts          # Business intelligence (activation, retention)
└── index.ts            # Main export file
```

## Naming Convention

**Pattern**: `{Domain}_{MetricType}_{Granularity}`

### Examples

- `DASHBOARD_WIDGET_METRICS` - Core widget counts for dashboard
- `WIDGETS_FEATURE_ADOPTION` - Feature usage analytics
- `WIDGETS_QUARTERLY_TRENDS` - Quarterly trend analysis
- `ORDERS_DAILY_TRENDS` - Daily order metrics

## Query Categories

### 1. Dashboard Queries (`dashboard.ts`)

**Purpose**: Real-time, essential metrics for main dashboard view

- `DASHBOARD_WIDGET_METRICS` - Total, active, locations
- `DASHBOARD_ORDER_METRICS` - Order totals
- `DASHBOARD_LOCATION_METRICS` - Location counts

### 2. Analytics Queries (`analytics.ts`)

**Purpose**: Detailed analysis and feature usage

- `WIDGETS_FEATURE_ADOPTION` - Feature usage statistics
- `WIDGETS_PERFORMANCE_METRICS` - Performance data
- `ORDERS_ANALYTICS` - Order analysis

### 3. Trend Queries (`trends.ts`)

**Purpose**: Time-based analysis and growth patterns

- `WIDGETS_QUARTERLY_TRENDS` - Quarterly trends
- `WIDGETS_MONTHLY_GROWTH` - Monthly growth
- `ORDERS_DAILY_TRENDS` - Daily order trends

### 4. Insight Queries (`insights.ts`)

**Purpose**: Business intelligence and predictive analytics

- `WIDGETS_ACTIVATION_INSIGHTS` - Activation patterns
- `WIDGETS_RETENTION_ANALYTICS` - Retention analysis
- `PREDICTIVE_INSIGHTS` - Predictive analytics

## Usage Examples

### Importing Queries

```typescript
// Import specific query categories
import { DASHBOARD_WIDGET_METRICS } from "../../graphql/lambda/queries/dashboard";
import { WIDGETS_FEATURE_ADOPTION } from "../../graphql/lambda/queries/analytics";
import { WIDGETS_QUARTERLY_TRENDS } from "../../graphql/lambda/queries/trends";

// Or import from main index
import { DASHBOARD_WIDGET_METRICS } from "../../graphql/lambda/queries";
```

### Using in Hooks

```typescript
export function useDashboardLambda() {
  const { data, loading, error } = useQuery<LambdaWidgetsResponse>(
    DASHBOARD_WIDGET_METRICS,
    {
      client: lambdaClient!,
      fetchPolicy: "cache-and-network",
    }
  );
  // ... rest of hook logic
}
```

## Migration Strategy

### Phase 1: New Structure (Complete)

- ✅ Created organized query files
- ✅ Established naming conventions
- ✅ Updated hooks to use new queries
- ✅ Maintained backward compatibility

### Phase 2: Backend Integration (Future)

- Replace frontend calculations with backend metrics
- Implement proper dashboard metrics query in Lambda
- Remove frontend filtering and calculations

### Phase 3: Cleanup (Future)

- Remove legacy query files
- Update all imports to use new structure
- Remove frontend calculations entirely

## Benefits

1. **Scalability**: Easy to add new analytics categories
2. **Clarity**: Clear naming shows query purpose
3. **Maintainability**: Organized by domain and type
4. **Backend-First**: Supports our development principle
5. **Consistency**: Standardized approach across all analytics

## Future Extensions

As the system grows, we can easily add:

- `WIDGETS_GEOGRAPHIC_ANALYTICS` - Geographic distribution
- `ORDERS_SEASONAL_TRENDS` - Seasonal patterns
- `USERS_ENGAGEMENT_METRICS` - User engagement
- `REVENUE_PREDICTIVE_INSIGHTS` - Revenue forecasting

## Notes

- All queries follow the backend-first principle
- Frontend calculations are temporary until backend metrics are implemented
- Legacy queries are maintained for backward compatibility during transition
- New queries should be added to appropriate category files
