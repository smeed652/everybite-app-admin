# Data Processing Pattern Architecture

## Overview

This document describes the architectural pattern for handling backend data in the EveryBite Admin application. This pattern provides a consistent approach for fetching, processing, and serving data to the UI while keeping frontend components simple and maintainable.

## Core Architecture

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Backend Data  │───▶│  Service Layer   │───▶│  Frontend UI    │
│                 │    │                  │    │                 │
│ • Lambda Query  │    │ • Process Data   │    │ • Display Data  │
│ • API Response  │    │ • Business Logic │    │ • User Input    │
│ • Raw JSON      │    │ • Transform      │    │ • Interactions  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Pattern Components

### 1. Data Source Layer

- **Lambda GraphQL Queries**: Native SQL queries via Metabase proxy
- **API Endpoints**: REST/GraphQL endpoints for real-time data
- **Raw Data**: JSON responses from backend services

### 2. Service Layer

- **Data Processing**: Transform raw data into structured formats
- **Business Logic**: Calculations, filtering, sorting, aggregations
- **Caching**: Local storage and Apollo cache management
- **Error Handling**: Consistent error processing and recovery

### 3. Frontend Layer

- **Custom Hooks**: Data fetching and service instantiation
- **Components**: UI presentation and user interactions
- **State Management**: Local component state and global state

## Implementation Pattern

### Service Class Structure

```typescript
export class DataService<T> {
  private rawData: T[];

  constructor(data: T[]) {
    this.rawData = data;
  }

  // Data Access Methods
  getById(id: string): T | null;
  getAll(): T[];
  getFiltered(filter: FilterCriteria): T[];

  // Business Logic Methods
  calculateMetrics(): Metrics;
  getRollups(): RollupData;
  getTrends(timeRange: TimeRange): TrendData;

  // Private Helper Methods
  private processData(): ProcessedData;
  private validateData(): ValidationResult;
}
```

### Hook Pattern

```typescript
export function useDataService<T>(query: DocumentNode) {
  const { data, loading, error } = useQuery(query);

  const service = useMemo(() => {
    if (!data) return null;
    return new DataService<T>(data);
  }, [data]);

  return {
    loading,
    error,
    service,
    // Convenience methods
    getById: (id: string) => service?.getById(id),
    getAll: () => service?.getAll(),
    getMetrics: () => service?.calculateMetrics(),
  };
}
```

### Component Pattern

```typescript
export function DataView() {
  const { getById, getMetrics, loading } = useDataService(DATA_QUERY);

  if (loading) return <LoadingSpinner />;

  const metrics = getMetrics();
  const items = getAll();

  return (
    <div>
      <MetricsDisplay metrics={metrics} />
      <DataTable data={items} />
    </div>
  );
}
```

## Use Cases

### 1. Widget Analytics

- **Data Source**: `everybite_analytics.db_widgets` + `widget_interactions`
- **Service**: `WidgetAnalyticsService`
- **Use Cases**: Dashboard metrics, widget details, performance analysis

### 2. User Management

- **Data Source**: AWS Cognito User Pool
- **Service**: `UserManagementService`
- **Use Cases**: User list, permissions, invite flow

### 3. SmartMenu Configuration

- **Data Source**: GraphQL API
- **Service**: `SmartMenuService`
- **Use Cases**: Configuration management, branding, features

### 4. Cache Management

- **Data Source**: localStorage + Apollo cache
- **Service**: `CacheManagementService`
- **Use Cases**: Cache status, operations, configuration

## Benefits

### ✅ Separation of Concerns

- **Backend**: Raw data and APIs
- **Service**: Business logic and data processing
- **Frontend**: UI presentation and user interactions

### ✅ Reusability

- Same service used across multiple views
- Consistent data processing patterns
- Shared business logic

### ✅ Maintainability

- Business logic centralized in services
- Easy to modify calculations and rules
- Type-safe operations with TypeScript

### ✅ Performance

- Data processed once, used many times
- Efficient filtering and sorting
- Memoized calculations and caching

### ✅ Testability

- Services can be unit tested independently
- Mock data easily injected
- Clear separation of concerns

## Implementation Guidelines

### 1. Service Design

- **Single Responsibility**: Each service handles one domain
- **Immutable Data**: Don't modify raw data, create new processed data
- **Error Handling**: Graceful handling of missing or invalid data
- **Type Safety**: Strong TypeScript interfaces for all data structures

### 2. Hook Design

- **Data Fetching**: Handle loading, error, and success states
- **Service Instantiation**: Memoize service creation
- **Convenience Methods**: Provide easy access to common operations
- **Caching**: Integrate with Apollo cache and localStorage

### 3. Component Design

- **Presentation Only**: Components focus on UI, not data processing
- **Props Interface**: Clear interfaces for component props
- **Loading States**: Consistent loading and error handling
- **Reusability**: Components should be reusable across different data sources

## File Structure

```
src/
├── services/
│   ├── base/
│   │   ├── DataService.ts          # Base service class
│   │   └── ServiceTypes.ts         # Common interfaces
│   ├── widgets/
│   │   ├── WidgetAnalyticsService.ts
│   │   ├── WidgetConfigurationService.ts
│   │   └── types.ts
│   ├── users/
│   │   ├── UserManagementService.ts
│   │   └── types.ts
│   └── cache/
│       ├── CacheManagementService.ts
│       └── types.ts
├── hooks/
│   ├── useDataService.ts           # Generic data service hook
│   ├── useWidgetAnalytics.ts       # Widget-specific hook
│   ├── useUserManagement.ts        # User-specific hook
│   └── useCacheManagement.ts       # Cache-specific hook
└── components/
    ├── data/
    │   ├── DataTable.tsx
    │   ├── MetricsDisplay.tsx
    │   └── LoadingSpinner.tsx
    └── widgets/
        ├── WidgetSettingsView.tsx
        ├── WidgetPerformanceView.tsx
        └── WidgetBehaviorView.tsx
```

## Migration Strategy

### Phase 1: Establish Pattern

1. Create base `DataService` class
2. Implement pattern for one domain (e.g., widgets)
3. Document patterns and guidelines

### Phase 2: Expand Usage

1. Apply pattern to other domains (users, cache, etc.)
2. Refactor existing components to use new pattern
3. Add comprehensive testing

### Phase 3: Optimize

1. Performance optimization
2. Advanced caching strategies
3. Real-time data updates

## Best Practices

### 1. Data Processing

- Always validate raw data before processing
- Use TypeScript for type safety
- Handle edge cases gracefully
- Document business logic clearly

### 2. Performance

- Memoize expensive calculations
- Use efficient data structures
- Implement proper caching strategies
- Monitor performance metrics

### 3. Error Handling

- Provide meaningful error messages
- Implement fallback data when possible
- Log errors for debugging
- Graceful degradation

### 4. Testing

- Unit test service methods
- Integration test data flow
- Mock external dependencies
- Test error scenarios

## Future Enhancements

### 1. Real-time Updates

- WebSocket integration for live data
- Optimistic updates
- Conflict resolution

### 2. Advanced Caching

- Intelligent cache invalidation
- Background data refresh
- Offline support

### 3. Data Analytics

- Usage analytics
- Performance monitoring
- A/B testing support

---

**Last Updated**: July 19, 2025  
**Version**: 1.0  
**Maintainer**: Development Team
