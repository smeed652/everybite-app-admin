// Cache configuration
export interface CacheConfig {
  ttl: number; // Default TTL in milliseconds
  scheduledRefresh: {
    enabled: boolean;
    time: string;
    timezone: string;
  };
  storage: {
    prefix: string;
    persistence: boolean;
  };
  enableCaching: boolean;
  // New: Individual TTLs for different pages
  queryTTLs: {
    dashboard: number; // TTL for dashboard page data (24 hours default)
    metabaseUsers: number; // TTL for metabase users data (12 hours default)
  };
}

const defaultConfig: CacheConfig = {
  ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  scheduledRefresh: {
    enabled: true,
    time: "06:00",
    timezone: "America/Los_Angeles",
  },
  storage: {
    prefix: "metabase-apollo-cache",
    persistence: true,
  },
  enableCaching: true,
  queryTTLs: {
    dashboard: 24 * 60 * 60 * 1000, // 24 hours
    metabaseUsers: 12 * 60 * 60 * 1000, // 12 hours
  },
};

export function getCacheConfig(): CacheConfig {
  try {
    const raw = localStorage.getItem("cacheConfig");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure all properties exist
      return {
        ...defaultConfig,
        ...parsed,
        queryTTLs: {
          ...defaultConfig.queryTTLs,
          ...parsed.queryTTLs,
        },
      };
    }
  } catch (e) {
    console.warn("[CacheConfig] Error reading cache config:", e);
  }
  return defaultConfig;
}

export function setCacheConfig(config: CacheConfig): void {
  try {
    localStorage.setItem("cacheConfig", JSON.stringify(config));
    console.log("[CacheConfig] Cache configuration updated:", config);
  } catch (e) {
    console.error("[CacheConfig] Error saving cache config:", e);
  }
}

// Helper function to get TTL for a specific query
export function getQueryTTL(queryName: string): number {
  const config = getCacheConfig();
  return (
    config.queryTTLs[queryName as keyof typeof config.queryTTLs] || config.ttl
  );
}

// Helper function to update TTL for a specific query
export function updateQueryTTL(queryName: string, ttlHours: number): void {
  const config = getCacheConfig();
  config.queryTTLs[queryName as keyof typeof config.queryTTLs] =
    ttlHours * 60 * 60 * 1000;
  setCacheConfig(config);
}

// Cache configuration utilities
export const cacheConfigUtils = {
  // Get formatted scheduled refresh time
  getFormattedScheduledTime: (config: CacheConfig) => {
    const time = config.scheduledRefresh.time;
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return {
      time: time,
      timezone: config.scheduledRefresh.timezone,
      formatted: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: config.scheduledRefresh.timezone,
      }),
    };
  },

  // Validate cache configuration
  validateConfig: (config: CacheConfig): string[] => {
    const errors: string[] = [];

    if (config.ttl <= 0) {
      errors.push("Cache TTL must be greater than 0");
    }

    if (!/^\d{2}:\d{2}$/.test(config.scheduledRefresh.time)) {
      errors.push("Scheduled refresh time must be in HH:MM format");
    }

    const [hours, minutes] = config.scheduledRefresh.time
      .split(":")
      .map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      errors.push("Scheduled refresh time must be a valid time");
    }

    return errors;
  },
};
