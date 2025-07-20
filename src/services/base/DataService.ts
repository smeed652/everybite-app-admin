import { DocumentNode, OperationVariables } from "@apollo/client";
import { lambdaService, ServiceConfig } from "./lambdaService";

export interface DataServiceConfig extends ServiceConfig {
  enableValidation?: boolean;
  enableMetrics?: boolean;
  defaultErrorHandler?: (error: Error) => void;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MetricsData {
  totalCount: number;
  filteredCount: number;
  processingTime: number;
  cacheHit: boolean;
}

export interface BusinessLogicResult<T> {
  data: T;
  metrics?: MetricsData;
  validation?: ValidationResult;
}

/**
 * Base Data Service Class - Provides generic data processing capabilities
 *
 * This class serves as the foundation for all domain-specific services,
 * providing common methods for data retrieval, processing, and business logic.
 */
export abstract class DataService<T = unknown, F = unknown> {
  protected config: DataServiceConfig;
  protected serviceName: string;

  constructor(serviceName: string, config: DataServiceConfig = {}) {
    this.serviceName = serviceName;
    this.config = {
      enableValidation: true,
      enableMetrics: true,
      ...config,
    };
  }

  /**
   * Execute a GraphQL query with business logic processing
   */
  protected async executeQuery<R>(
    document: DocumentNode,
    variables?: OperationVariables,
    options?: {
      validateInput?: (vars: OperationVariables) => ValidationResult;
      processResult?: (data: R) => R;
      calculateMetrics?: (data: R, processingTime: number) => MetricsData;
    }
  ): Promise<BusinessLogicResult<R>> {
    const startTime = Date.now();

    try {
      // Input validation
      if (options?.validateInput && variables) {
        const validation = options.validateInput(variables);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }
      }

      // Execute query
      const result = await lambdaService.query<R>(
        document,
        variables,
        this.config
      );

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        throw new Error("No data returned from query");
      }

      // Process result
      const processedData = options?.processResult
        ? options.processResult(result.data)
        : result.data;

      // Calculate metrics
      const processingTime = Date.now() - startTime;
      const metrics =
        options?.calculateMetrics && this.config.enableMetrics
          ? options.calculateMetrics(processedData, processingTime)
          : undefined;

      return {
        data: processedData,
        metrics,
      };
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get data by ID with validation and processing
   */
  async getById(id: string | number): Promise<BusinessLogicResult<T>> {
    const document = this.getByIdQuery();
    const variables = { id };

    return this.executeQuery<T>(document, variables, {
      validateInput: (vars) => this.validateId(vars.id),
      processResult: (data) => this.processByIdResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateGetByIdMetrics(data, processingTime),
    });
  }

  /**
   * Get all data with optional filtering
   */
  async getAll(filters?: F): Promise<BusinessLogicResult<T[]>> {
    const document = this.getAllQuery();
    const variables = filters ? { filters } : undefined;

    return this.executeQuery<T[]>(document, variables, {
      validateInput: (vars) => this.validateFilters(vars.filters),
      processResult: (data) => this.processGetAllResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateGetAllMetrics(data, processingTime),
    });
  }

  /**
   * Get filtered data based on criteria
   */
  async getFiltered(filters: F): Promise<BusinessLogicResult<T[]>> {
    const document = this.getFilteredQuery();
    const variables = { filters };

    return this.executeQuery<T[]>(document, variables, {
      validateInput: (vars) => this.validateFilters(vars.filters),
      processResult: (data) => this.processFilteredResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateFilteredMetrics(data, processingTime),
    });
  }

  /**
   * Calculate metrics and analytics from data
   */
  async calculateMetrics(
    data: T[]
  ): Promise<BusinessLogicResult<Record<string, unknown>>> {
    const startTime = Date.now();

    try {
      const metrics = await this.computeMetrics(data);
      const processingTime = Date.now() - startTime;

      return {
        data: metrics,
        metrics: {
          totalCount: data.length,
          filteredCount: data.length,
          processingTime,
          cacheHit: false,
        },
      };
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get rollup/aggregated data
   */
  async getRollups(
    groupBy: string[]
  ): Promise<BusinessLogicResult<Record<string, unknown>[]>> {
    const document = this.getRollupsQuery();
    const variables = { groupBy };

    return this.executeQuery<Record<string, unknown>[]>(document, variables, {
      validateInput: (vars) => this.validateGroupBy(vars.groupBy),
      processResult: (data) => this.processRollupsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateRollupsMetrics(data, processingTime),
    });
  }

  /**
   * Get trend analysis data
   */
  async getTrends(timeRange: {
    start: Date;
    end: Date;
  }): Promise<BusinessLogicResult<Record<string, unknown>[]>> {
    const document = this.getTrendsQuery();
    const variables = { timeRange };

    return this.executeQuery<Record<string, unknown>[]>(document, variables, {
      validateInput: (vars) => this.validateTimeRange(vars.timeRange),
      processResult: (data) => this.processTrendsResult(data),
      calculateMetrics: (data, processingTime) =>
        this.calculateTrendsMetrics(data, processingTime),
    });
  }

  // Abstract methods that must be implemented by domain-specific services
  protected abstract getByIdQuery(): DocumentNode;
  protected abstract getAllQuery(): DocumentNode;
  protected abstract getFilteredQuery(): DocumentNode;
  protected abstract getRollupsQuery(): DocumentNode;
  protected abstract getTrendsQuery(): DocumentNode;

  // Default implementations that can be overridden
  protected validateId(id: unknown): ValidationResult {
    if (!id || (typeof id !== "string" && typeof id !== "number")) {
      return { isValid: false, errors: ["Invalid ID provided"] };
    }
    return { isValid: true, errors: [] };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validateFilters(filters: unknown): ValidationResult {
    // Default implementation - can be overridden by domain services
    return { isValid: true, errors: [] };
  }

  protected validateGroupBy(groupBy: unknown): ValidationResult {
    if (!Array.isArray(groupBy) || groupBy.length === 0) {
      return { isValid: false, errors: ["GroupBy must be a non-empty array"] };
    }
    return { isValid: true, errors: [] };
  }

  protected validateTimeRange(timeRange: unknown): ValidationResult {
    if (!timeRange || typeof timeRange !== "object") {
      return { isValid: false, errors: ["Invalid time range provided"] };
    }
    const { start, end } = timeRange as { start: unknown; end: unknown };
    if (!start || !end || !(start instanceof Date) || !(end instanceof Date)) {
      return {
        isValid: false,
        errors: ["Time range must have valid start and end dates"],
      };
    }
    if (start >= end) {
      return { isValid: false, errors: ["Start date must be before end date"] };
    }
    return { isValid: true, errors: [] };
  }

  // Processing methods that can be overridden
  protected processByIdResult(data: T): T {
    return data;
  }

  protected processGetAllResult(data: T[]): T[] {
    return data;
  }

  protected processFilteredResult(data: T[]): T[] {
    return data;
  }

  protected processRollupsResult(
    data: Record<string, unknown>[]
  ): Record<string, unknown>[] {
    return data;
  }

  protected processTrendsResult(
    data: Record<string, unknown>[]
  ): Record<string, unknown>[] {
    return data;
  }

  // Metrics calculation methods that can be overridden
  protected calculateGetByIdMetrics(
    data: T,
    processingTime: number
  ): MetricsData {
    return {
      totalCount: 1,
      filteredCount: 1,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateGetAllMetrics(
    data: T[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateFilteredMetrics(
    data: T[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateRollupsMetrics(
    data: Record<string, unknown>[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateTrendsMetrics(
    data: Record<string, unknown>[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  // Business logic methods that can be overridden
  protected async computeMetrics(data: T[]): Promise<Record<string, unknown>> {
    return {
      count: data.length,
      timestamp: new Date().toISOString(),
    };
  }

  // Error handling
  protected handleError(error: Error): void {
    console.error(`[${this.serviceName}] Error:`, error);

    if (this.config.defaultErrorHandler) {
      this.config.defaultErrorHandler(error);
    }
  }

  // Utility methods
  protected log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      console.log(`[${this.serviceName}] ${message}`, data || "");
    }
  }
}
