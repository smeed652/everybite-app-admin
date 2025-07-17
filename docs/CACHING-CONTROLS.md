# Apollo Caching Controls

This document explains how to control Apollo caching behavior in the EveryBite Admin application.

## Overview

The application uses Apollo Client with persistent localStorage caching to minimize Lambda invocations and improve performance. Caching can be controlled via environment variables and the provided toggle script.

## Caching Behavior by Environment

- **Development**: Caching is disabled by default, but can be enabled via environment variable
- **Staging**: Caching is always enabled
- **Production**: Caching is always enabled

## Development Caching Controls

### Using the Toggle Script

The easiest way to control caching in development is using the provided script:

```bash
# Check current caching status
./scripts/toggle-caching.sh

# Enable caching
./scripts/toggle-caching.sh on

# Disable caching
./scripts/toggle-caching.sh off
```

### Manual Environment Variable Control

You can also manually control caching by setting the `VITE_ENABLE_CACHING` environment variable in your `.env.local` file:

```bash
# Enable caching
echo "VITE_ENABLE_CACHING=true" >> .env.local

# Disable caching (remove the line or set to false)
# VITE_ENABLE_CACHING=false
```

### Restart Required

After changing the caching setting, you must restart your development server:

```bash
npm run dev
```

## Scheduled Refresh Configuration

### Using the Configuration Script

Configure scheduled refresh settings using the provided script:

```bash
# Show current configuration
./scripts/configure-cache.sh

# Set refresh time (e.g., 6:00 AM)
./scripts/configure-cache.sh time 06:00

# Set timezone (e.g., Eastern Time)
./scripts/configure-cache.sh timezone America/New_York

# Set cache TTL (e.g., 12 hours = 43200000 milliseconds)
./scripts/configure-cache.sh ttl 43200000

# Enable/disable scheduled refresh
./scripts/configure-cache.sh enable
./scripts/configure-cache.sh disable
```

### Manual Environment Variable Configuration

You can also manually configure scheduled refresh via environment variables:

```bash
# Set refresh time (HH:MM format)
VITE_SCHEDULED_REFRESH_TIME=06:00

# Set timezone (IANA timezone format)
VITE_SCHEDULED_REFRESH_TIMEZONE=America/Los_Angeles

# Set cache TTL in milliseconds
VITE_CACHE_TTL=86400000

# Enable/disable scheduled refresh
VITE_SCHEDULED_REFRESH_ENABLED=true
```

## Cache Status Component

The dashboard includes a "Cache Status" component that shows:

- Whether caching is enabled/disabled
- Scheduled refresh information and next refresh time
- Current cached operations and their age
- Manual refresh controls
- Cache status indicators (Fresh/Stale)

## Cache Configuration

### Cache TTL

- **Duration**: 24 hours (configurable)
- **Storage**: localStorage with prefix `metabase-apollo-cache-`
- **Refresh**: Automatic scheduled refresh daily at 6:00 AM PT (configurable)

### Scheduled Refresh

- **Default Time**: 6:00 AM Pacific Time
- **Frequency**: Daily
- **Configurable**: Time, timezone, and enable/disable via environment variables
- **Benefits**: Ensures fresh data for first users of the day

### Cached Operations

- `quarterlyMetrics` - Quarterly growth metrics
- `widgetAnalytics` - Widget interaction analytics
- `dailyInteractions` - Daily interaction data
- `widgets` - Widget listing data

### Cache Policies

- **Fetch Policy**: `cache-first` (when enabled) or `network-only` (when disabled)
- **Merge Policy**: `false` (replace entirely, don't merge)
- **Error Policy**: `all` (return partial results on errors)

## Cache Management API

The `cacheUtils` object provides programmatic cache control:

```typescript
import { cacheUtils } from "../lib/metabase-apollo";

// Check if caching is enabled
const isEnabled = cacheUtils.isEnabled();

// Get cache status
const status = cacheUtils.getCacheStatus();

// Clear all cached data
cacheUtils.clearCache();

// Refresh specific operation
await cacheUtils.refreshOperation("quarterlyMetrics");
```

## Best Practices

### Development

- Disable caching when debugging data issues
- Enable caching when testing performance
- Use the cache status component to monitor cache behavior

### Production

- Always keep caching enabled for optimal performance
- Monitor cache hit rates via the cache status component
- Use manual refresh when needed for critical data updates

## Troubleshooting

### Cache Not Working

1. Check if caching is enabled: `./scripts/toggle-caching.sh`
2. Verify environment variable: `VITE_ENABLE_CACHING=true`
3. Restart development server
4. Check browser console for cache-related logs

### Stale Data Issues

1. Use the "Refresh All" button in the cache status component
2. Clear browser localStorage manually
3. Check if background refresh is running (every 24 hours)

### Performance Issues

1. Monitor cache hit rates in the cache status component
2. Consider adjusting cache TTL if needed
3. Use manual refresh for critical operations
