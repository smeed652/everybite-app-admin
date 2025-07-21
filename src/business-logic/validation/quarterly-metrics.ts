/**
 * Business Logic: Quarterly Metrics Validation
 *
 * Pure functions for validating quarterly metrics data.
 * These functions are UI-independent and can be tested separately.
 */

import { QuarterlyMetricInput } from "../quarterly-metrics/transformers";
import {
  ValidationError,
  ValidationResult,
  ValidationRuleType,
  createValidationError,
  createValidationResult,
} from "../types";

/**
 * Validate quarterly metrics data structure
 */
export function validateQuarterlyMetrics(
  quarterlyMetrics: any[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(quarterlyMetrics)) {
    errors.push(
      createValidationError(
        "quarterlyMetrics",
        ValidationRuleType.ARRAY,
        "Quarterly metrics must be an array"
      )
    );
    return createValidationResult(
      false,
      errors.map((e) => e.message)
    );
  }

  quarterlyMetrics.forEach((item, index) => {
    const prefix = `Item ${index}`;

    // Validate quarterLabel
    if (!item.quarterLabel || typeof item.quarterLabel !== "string") {
      errors.push(
        createValidationError(
          `${prefix}.quarterLabel`,
          ValidationRuleType.REQUIRED,
          "quarterLabel is required and must be a string"
        )
      );
    }

    // Validate orders
    if (item.orders) {
      if (typeof item.orders !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.orders`,
            ValidationRuleType.OBJECT,
            "orders must be an object"
          )
        );
      } else {
        if (typeof item.orders.count !== "number") {
          errors.push(
            createValidationError(
              `${prefix}.orders.count`,
              ValidationRuleType.NUMBER,
              "orders.count must be a number"
            )
          );
        }
        if (
          item.orders.qoqGrowth !== undefined &&
          typeof item.orders.qoqGrowth !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.orders.qoqGrowth`,
              ValidationRuleType.NUMBER,
              "orders.qoqGrowth must be a number"
            )
          );
        }
        if (
          item.orders.qoqGrowthPercent !== undefined &&
          typeof item.orders.qoqGrowthPercent !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.orders.qoqGrowthPercent`,
              ValidationRuleType.NUMBER,
              "orders.qoqGrowthPercent must be a number"
            )
          );
        }
      }
    }

    // Validate locations
    if (item.locations) {
      if (typeof item.locations !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.locations`,
            ValidationRuleType.OBJECT,
            "locations must be an object"
          )
        );
      } else {
        if (typeof item.locations.count !== "number") {
          errors.push(
            createValidationError(
              `${prefix}.locations.count`,
              ValidationRuleType.NUMBER,
              "locations.count must be a number"
            )
          );
        }
        if (
          item.locations.qoqGrowth !== undefined &&
          typeof item.locations.qoqGrowth !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.locations.qoqGrowth`,
              ValidationRuleType.NUMBER,
              "locations.qoqGrowth must be a number"
            )
          );
        }
        if (
          item.locations.qoqGrowthPercent !== undefined &&
          typeof item.locations.qoqGrowthPercent !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.locations.qoqGrowthPercent`,
              ValidationRuleType.NUMBER,
              "locations.qoqGrowthPercent must be a number"
            )
          );
        }
      }
    }

    // Validate activeSmartMenus
    if (item.activeSmartMenus) {
      if (typeof item.activeSmartMenus !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.activeSmartMenus`,
            ValidationRuleType.OBJECT,
            "activeSmartMenus must be an object"
          )
        );
      } else {
        if (typeof item.activeSmartMenus.count !== "number") {
          errors.push(
            createValidationError(
              `${prefix}.activeSmartMenus.count`,
              ValidationRuleType.NUMBER,
              "activeSmartMenus.count must be a number"
            )
          );
        }
        if (
          item.activeSmartMenus.qoqGrowth !== undefined &&
          typeof item.activeSmartMenus.qoqGrowth !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.activeSmartMenus.qoqGrowth`,
              ValidationRuleType.NUMBER,
              "activeSmartMenus.qoqGrowth must be a number"
            )
          );
        }
        if (
          item.activeSmartMenus.qoqGrowthPercent !== undefined &&
          typeof item.activeSmartMenus.qoqGrowthPercent !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.activeSmartMenus.qoqGrowthPercent`,
              ValidationRuleType.NUMBER,
              "activeSmartMenus.qoqGrowthPercent must be a number"
            )
          );
        }
      }
    }

    // Validate brands
    if (item.brands) {
      if (typeof item.brands !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.brands`,
            ValidationRuleType.OBJECT,
            "brands must be an object"
          )
        );
      } else {
        if (typeof item.brands.count !== "number") {
          errors.push(
            createValidationError(
              `${prefix}.brands.count`,
              ValidationRuleType.NUMBER,
              "brands.count must be a number"
            )
          );
        }
        if (
          item.brands.qoqGrowth !== undefined &&
          typeof item.brands.qoqGrowth !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.brands.qoqGrowth`,
              ValidationRuleType.NUMBER,
              "brands.qoqGrowth must be a number"
            )
          );
        }
        if (
          item.brands.qoqGrowthPercent !== undefined &&
          typeof item.brands.qoqGrowthPercent !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.brands.qoqGrowthPercent`,
              ValidationRuleType.NUMBER,
              "brands.qoqGrowthPercent must be a number"
            )
          );
        }
      }
    }

    // Validate totalRevenue
    if (item.totalRevenue) {
      if (typeof item.totalRevenue !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.totalRevenue`,
            ValidationRuleType.OBJECT,
            "totalRevenue must be an object"
          )
        );
      } else {
        if (typeof item.totalRevenue.amount !== "number") {
          errors.push(
            createValidationError(
              `${prefix}.totalRevenue.amount`,
              ValidationRuleType.NUMBER,
              "totalRevenue.amount must be a number"
            )
          );
        }
        if (
          item.totalRevenue.qoqGrowth !== undefined &&
          typeof item.totalRevenue.qoqGrowth !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.totalRevenue.qoqGrowth`,
              ValidationRuleType.NUMBER,
              "totalRevenue.qoqGrowth must be a number"
            )
          );
        }
        if (
          item.totalRevenue.qoqGrowthPercent !== undefined &&
          typeof item.totalRevenue.qoqGrowthPercent !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.totalRevenue.qoqGrowthPercent`,
              ValidationRuleType.NUMBER,
              "totalRevenue.qoqGrowthPercent must be a number"
            )
          );
        }
      }
    }
  });

  return createValidationResult(
    errors.length === 0,
    errors.map((e) => e.message)
  );
}

/**
 * Validate quarterly metrics data with detailed error reporting
 */
export function validateQuarterlyMetricsDetailed(quarterlyMetrics: any[]): {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Array.isArray(quarterlyMetrics)) {
    errors.push(
      createValidationError(
        "quarterlyMetrics",
        ValidationRuleType.ARRAY,
        "Quarterly metrics must be an array"
      )
    );
    return { isValid: false, errors, warnings };
  }

  quarterlyMetrics.forEach((item, index) => {
    const prefix = `Item ${index}`;

    // Validate quarterLabel
    if (!item.quarterLabel || typeof item.quarterLabel !== "string") {
      errors.push(
        createValidationError(
          `${prefix}.quarterLabel`,
          ValidationRuleType.REQUIRED,
          "quarterLabel is required and must be a string"
        )
      );
    }

    // Check for negative values (warnings)
    const checkNegativeValue = (value: any, field: string) => {
      if (typeof value === "number" && value < 0) {
        warnings.push(
          createValidationError(
            `${prefix}.${field}`,
            ValidationRuleType.MIN,
            `${field} has a negative value, which may indicate data issues`,
            value,
            0
          )
        );
      }
    };

    // Validate and check each metric
    const validateMetric = (metric: any, metricName: string) => {
      if (!metric) return;

      if (typeof metric !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.${metricName}`,
            ValidationRuleType.OBJECT,
            `${metricName} must be an object`
          )
        );
        return;
      }

      if (typeof metric.count !== "number") {
        errors.push(
          createValidationError(
            `${prefix}.${metricName}.count`,
            ValidationRuleType.NUMBER,
            `${metricName}.count must be a number`
          )
        );
      } else {
        checkNegativeValue(metric.count, `${metricName}.count`);
      }

      if (
        metric.qoqGrowth !== undefined &&
        typeof metric.qoqGrowth !== "number"
      ) {
        errors.push(
          createValidationError(
            `${prefix}.${metricName}.qoqGrowth`,
            ValidationRuleType.NUMBER,
            `${metricName}.qoqGrowth must be a number`
          )
        );
      }

      if (
        metric.qoqGrowthPercent !== undefined &&
        typeof metric.qoqGrowthPercent !== "number"
      ) {
        errors.push(
          createValidationError(
            `${prefix}.${metricName}.qoqGrowthPercent`,
            ValidationRuleType.NUMBER,
            `${metricName}.qoqGrowthPercent must be a number`
          )
        );
      }
    };

    // Validate each metric
    validateMetric(item.orders, "orders");
    validateMetric(item.locations, "locations");
    validateMetric(item.activeSmartMenus, "activeSmartMenus");
    validateMetric(item.brands, "brands");

    // Special validation for totalRevenue (has amount instead of count)
    if (item.totalRevenue) {
      if (typeof item.totalRevenue !== "object") {
        errors.push(
          createValidationError(
            `${prefix}.totalRevenue`,
            ValidationRuleType.OBJECT,
            "totalRevenue must be an object"
          )
        );
      } else {
        if (typeof item.totalRevenue.amount !== "number") {
          errors.push(
            createValidationError(
              `${prefix}.totalRevenue.amount`,
              ValidationRuleType.NUMBER,
              "totalRevenue.amount must be a number"
            )
          );
        } else {
          checkNegativeValue(item.totalRevenue.amount, "totalRevenue.amount");
        }

        if (
          item.totalRevenue.qoqGrowth !== undefined &&
          typeof item.totalRevenue.qoqGrowth !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.totalRevenue.qoqGrowth`,
              ValidationRuleType.NUMBER,
              "totalRevenue.qoqGrowth must be a number"
            )
          );
        }

        if (
          item.totalRevenue.qoqGrowthPercent !== undefined &&
          typeof item.totalRevenue.qoqGrowthPercent !== "number"
        ) {
          errors.push(
            createValidationError(
              `${prefix}.totalRevenue.qoqGrowthPercent`,
              ValidationRuleType.NUMBER,
              "totalRevenue.qoqGrowthPercent must be a number"
            )
          );
        }
      }
    }

    // Check for missing required metrics (warnings)
    if (
      !item.orders &&
      !item.locations &&
      !item.activeSmartMenus &&
      !item.brands
    ) {
      warnings.push(
        createValidationError(
          `${prefix}`,
          ValidationRuleType.REQUIRED,
          "Item has no metrics data, which may indicate incomplete data"
        )
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate quarter label format
 */
export function validateQuarterLabel(quarterLabel: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!quarterLabel || typeof quarterLabel !== "string") {
    errors.push(
      createValidationError(
        "quarterLabel",
        ValidationRuleType.REQUIRED,
        "Quarter label is required and must be a string"
      )
    );
    return createValidationResult(
      false,
      errors.map((e) => e.message)
    );
  }

  // Check for common quarter label patterns
  const quarterPattern =
    /^(Q[1-4]\s+\d{4}|Quarter\s+[1-4]\s+\d{4}|\d{4}-Q[1-4])$/i;
  if (!quarterPattern.test(quarterLabel)) {
    errors.push(
      createValidationError(
        "quarterLabel",
        ValidationRuleType.PATTERN,
        "Quarter label should follow format: Q1 2024, Quarter 1 2024, or 2024-Q1"
      )
    );
  }

  return createValidationResult(
    errors.length === 0,
    errors.map((e) => e.message)
  );
}

/**
 * Validate growth percentage values
 */
export function validateGrowthPercentage(
  value: number,
  field: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof value !== "number") {
    errors.push(
      createValidationError(
        field,
        ValidationRuleType.NUMBER,
        "Growth percentage must be a number"
      )
    );
    return createValidationResult(
      false,
      errors.map((e) => e.message)
    );
  }

  // Check for unreasonable growth percentages (warnings would be better, but keeping as errors for now)
  if (value > 1000) {
    errors.push(
      createValidationError(
        field,
        ValidationRuleType.MAX,
        "Growth percentage seems unreasonably high (>1000%)",
        value,
        1000
      )
    );
  }

  if (value < -100) {
    errors.push(
      createValidationError(
        field,
        ValidationRuleType.MIN,
        "Growth percentage cannot be less than -100%",
        value,
        -100
      )
    );
  }

  return createValidationResult(
    errors.length === 0,
    errors.map((e) => e.message)
  );
}

/**
 * Validate that quarterly data is in chronological order
 */
export function validateChronologicalOrder(
  quarterlyMetrics: QuarterlyMetricInput[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(quarterlyMetrics) || quarterlyMetrics.length < 2) {
    return createValidationResult(true, []); // Not enough data to validate order
  }

  // Extract year and quarter from labels for comparison
  const parseQuarter = (
    label: string
  ): { year: number; quarter: number } | null => {
    const match = label.match(/Q([1-4])\s+(\d{4})/i);
    if (match) {
      return { quarter: parseInt(match[1]), year: parseInt(match[2]) };
    }
    return null;
  };

  for (let i = 0; i < quarterlyMetrics.length - 1; i++) {
    const current = parseQuarter(quarterlyMetrics[i].quarterLabel);
    const next = parseQuarter(quarterlyMetrics[i + 1].quarterLabel);

    if (!current || !next) {
      continue; // Skip if we can't parse the quarter labels
    }

    const currentValue = current.year * 4 + current.quarter;
    const nextValue = next.year * 4 + next.quarter;

    if (currentValue <= nextValue) {
      errors.push(
        createValidationError(
          `Item ${i} and ${i + 1}`,
          ValidationRuleType.CUSTOM,
          `Quarterly data should be in descending chronological order. Found ${quarterlyMetrics[i].quarterLabel} followed by ${quarterlyMetrics[i + 1].quarterLabel}`
        )
      );
    }
  }

  return createValidationResult(
    errors.length === 0,
    errors.map((e) => e.message)
  );
}
