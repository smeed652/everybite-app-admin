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
  // Operation-level TTLs for different operations
  operationTTLs: {
    [operationName: string]: number;
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
  operationTTLs: {
    // SmartMenus operations (never cached - real-time data required)
    GetWidget: 0, // Never cached
    GetWidgets: 0, // Never cached
    GetSmartMenus: 0, // Never cached

    // User operations
    GetUser: 0, // Never cached - single user details (real-time)
    // All other operations will use the default TTL (24 hours)
  },
};

export function getCacheConfig(): CacheConfig {
  try {
    const raw = localStorage.getItem("cacheConfig");
    if (raw) {
      const parsed = JSON.parse(raw);

      // Handle case where operationTTLs might be stored as a JSON string
      let operationTTLs = parsed.operationTTLs;
      if (typeof operationTTLs === "string") {
        try {
          operationTTLs = JSON.parse(operationTTLs);
        } catch (e) {
          console.warn("[CacheConfig] Error parsing operationTTLs string:", e);
          operationTTLs = {};
        }
      }

      // Merge with defaults to ensure all properties exist
      return {
        ...defaultConfig,
        ...parsed,
        operationTTLs: {
          ...defaultConfig.operationTTLs,
          ...operationTTLs,
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

// Helper function to get TTL for a specific operation
export function getQueryTTL(operationName: string): number {
  const config = getCacheConfig();
  return config.operationTTLs[operationName] || config.ttl;
}

// Helper function to update TTL for a specific operation
export function updateOperationTTL(
  operationName: string,
  ttlHours: number
): void {
  const config = getCacheConfig();
  config.operationTTLs[operationName] = ttlHours * 60 * 60 * 1000;
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
