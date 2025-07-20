import { lambdaService } from "../services/base/lambdaService";

export interface CacheOperationStrategy {
  refresh: (operationName: string) => Promise<void>;
  clear: (operationName: string) => Promise<void>;
}

// Strategy for SmartMenuSettingsHybrid operation
const smartMenuSettingsHybridStrategy: CacheOperationStrategy = {
  refresh: async () => {
    // Clear Apollo cache to force fresh data
    await lambdaService.clearCache();

    // Use the SmartMenuSettingsHybridService to refresh the data
    const { SmartMenuSettingsHybridService } = await import(
      "../services/smartmenus/SmartMenuSettingsHybridService"
    );
    const hybridService = new SmartMenuSettingsHybridService();
    await hybridService.getSmartMenuSettings();
  },
  clear: async (operationName: string) => {
    // Clear Lambda service cache
    lambdaService.clearOperationCache(operationName);

    // Clear hybrid service's own localStorage cache
    const { SmartMenuSettingsHybridService } = await import(
      "../services/smartmenus/SmartMenuSettingsHybridService"
    );
    const hybridService = new SmartMenuSettingsHybridService();
    hybridService.clearCache();
  },
};

// Strategy for MetabaseUsers operation
const metabaseUsersStrategy: CacheOperationStrategy = {
  refresh: async () => {
    // Clear Apollo cache to force fresh data
    await lambdaService.clearCache();

    // Use the MetabaseUsersService to refresh the data
    const { MetabaseUsersService } = await import(
      "../services/api/lambda/MetabaseUsersService"
    );
    const metabaseService = new MetabaseUsersService();
    await metabaseService.getMetabaseUsers(1, 50);
  },
  clear: async (operationName: string) => {
    // Clear Lambda service cache
    lambdaService.clearOperationCache(operationName);

    // Clear MetabaseUsersService's own localStorage cache
    const { MetabaseUsersService } = await import(
      "../services/api/lambda/MetabaseUsersService"
    );
    const metabaseService = new MetabaseUsersService();
    metabaseService.clearCache();
  },
};

// Default strategy for unknown operations
const defaultStrategy: CacheOperationStrategy = {
  refresh: async (operationName: string) => {
    console.warn(`No refresh strategy found for operation: ${operationName}`);
  },
  clear: async (operationName: string) => {
    lambdaService.clearOperationCache(operationName);
  },
};

// Strategy mapping
const operationStrategies: Record<string, CacheOperationStrategy> = {
  // SmartMenu operations
  SmartMenuSettingsHybrid: smartMenuSettingsHybridStrategy,

  // User operations
  MetabaseUsers: metabaseUsersStrategy,
};

export function getOperationStrategy(
  operationName: string
): CacheOperationStrategy {
  return operationStrategies[operationName] || defaultStrategy;
}

export function refreshOperation(operationName: string): Promise<void> {
  const strategy = getOperationStrategy(operationName);
  return strategy.refresh(operationName);
}

export function clearOperation(operationName: string): Promise<void> {
  const strategy = getOperationStrategy(operationName);
  return strategy.clear(operationName);
}
