import { describe, expect, it } from "vitest";
import {
  calculateOrdersDelta,
  calculateTotalOrders,
  transformQuarterlyData,
  validateQuarterlyMetrics,
  type QuarterlyMetricInput,
  type QuarterlyMetricOutput,
} from "../transformers";

describe("Quarterly Metrics Transformers - Business Logic", () => {
  describe("transformQuarterlyData", () => {
    it("should transform complete quarterly metrics correctly", () => {
      const input: QuarterlyMetricInput[] = [
        {
          quarterLabel: "Q3 2025",
          brands: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
          totalRevenue: {
            amount: 50000,
            qoqGrowth: 10000,
            qoqGrowthPercent: 25,
          },
        },
      ];

      const result = transformQuarterlyData(input);

      expect(result).toEqual([
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 1000,
          ordersQoQGrowth: 25,
        },
      ]);
    });

    it("should handle missing brands field with fallback to activeSmartMenus", () => {
      const input: QuarterlyMetricInput[] = [
        {
          quarterLabel: "Q3 2025",
          // Missing brands field - this was causing the crash
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
        },
      ];

      const result = transformQuarterlyData(input);

      expect(result[0].brands).toBe(5); // Should fall back to activeSmartMenus count
    });

    it("should handle missing brands and activeSmartMenus with zero fallback", () => {
      const input: QuarterlyMetricInput[] = [
        {
          quarterLabel: "Q3 2025",
          // Missing both brands and activeSmartMenus
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
        },
      ];

      const result = transformQuarterlyData(input);

      expect(result[0].brands).toBe(0); // Should fall back to 0
    });

    it("should handle missing nested count fields", () => {
      const input: QuarterlyMetricInput[] = [
        {
          quarterLabel: "Q3 2025",
          brands: {} as any, // Missing count
          locations: {} as any, // Missing count
          orders: {} as any, // Missing count
          activeSmartMenus: {} as any, // Missing count
        },
      ];

      const result = transformQuarterlyData(input);

      expect(result).toEqual([
        {
          quarter: "Q3 2025",
          brands: 0,
          locations: 0,
          activeSmartMenus: 0,
          orders: 0,
          ordersQoQGrowth: 0,
        },
      ]);
    });

    it("should handle null/undefined input gracefully", () => {
      expect(transformQuarterlyData(null)).toEqual([]);
      expect(transformQuarterlyData(undefined)).toEqual([]);
      expect(transformQuarterlyData([])).toEqual([]);
    });

    it("should handle malformed input gracefully", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          // Completely malformed - missing all expected fields
        },
      ] as any;

      const result = transformQuarterlyData(input);

      expect(result).toEqual([
        {
          quarter: "Q3 2025",
          brands: 0,
          locations: 0,
          activeSmartMenus: 0,
          orders: 0,
          ordersQoQGrowth: 0,
        },
      ]);
    });

    it("should handle missing quarterLabel with fallback", () => {
      const input = [
        {
          // Missing quarterLabel
          brands: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
        },
      ] as any;

      const result = transformQuarterlyData(input);

      expect(result[0].quarter).toBe("Unknown Quarter");
    });

    it("should transform multiple quarters correctly", () => {
      const input: QuarterlyMetricInput[] = [
        {
          quarterLabel: "Q3 2025",
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
        },
        {
          quarterLabel: "Q2 2025",
          orders: { count: 800, qoqGrowth: 150, qoqGrowthPercent: 23 },
        },
      ];

      const result = transformQuarterlyData(input);

      expect(result).toHaveLength(2);
      expect(result[0].quarter).toBe("Q3 2025");
      expect(result[0].orders).toBe(1000);
      expect(result[1].quarter).toBe("Q2 2025");
      expect(result[1].orders).toBe(800);
    });
  });

  describe("calculateTotalOrders", () => {
    it("should calculate total orders correctly", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 1000,
          ordersQoQGrowth: 25,
        },
        {
          quarter: "Q2 2025",
          brands: 3,
          locations: 80,
          activeSmartMenus: 3,
          orders: 800,
          ordersQoQGrowth: 20,
        },
      ];

      const result = calculateTotalOrders(quarterlyData);

      expect(result).toBe(1800);
    });

    it("should return 0 for empty array", () => {
      const result = calculateTotalOrders([]);
      expect(result).toBe(0);
    });

    it("should handle quarters with zero orders", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 0,
          ordersQoQGrowth: 0,
        },
        {
          quarter: "Q2 2025",
          brands: 3,
          locations: 80,
          activeSmartMenus: 3,
          orders: 800,
          ordersQoQGrowth: 20,
        },
      ];

      const result = calculateTotalOrders(quarterlyData);

      expect(result).toBe(800);
    });
  });

  describe("calculateOrdersDelta", () => {
    it("should calculate positive growth correctly", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 1000,
          ordersQoQGrowth: 25,
        },
        {
          quarter: "Q2 2025",
          brands: 3,
          locations: 80,
          activeSmartMenus: 3,
          orders: 800,
          ordersQoQGrowth: 20,
        },
      ];

      const result = calculateOrdersDelta(quarterlyData);

      expect(result).toBe("+25.0%");
    });

    it("should calculate negative growth correctly", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 600,
          ordersQoQGrowth: -25,
        },
        {
          quarter: "Q2 2025",
          brands: 3,
          locations: 80,
          activeSmartMenus: 3,
          orders: 800,
          ordersQoQGrowth: 20,
        },
      ];

      const result = calculateOrdersDelta(quarterlyData);

      expect(result).toBe("-25.0%");
    });

    it("should handle empty array", () => {
      const result = calculateOrdersDelta([]);
      expect(result).toBe("0%");
    });

    it("should handle single quarter with orders", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 1000,
          ordersQoQGrowth: 25,
        },
      ];

      const result = calculateOrdersDelta(quarterlyData);

      expect(result).toBe("+25.0%");
    });

    it("should handle single quarter with zero orders", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 0,
          ordersQoQGrowth: 0,
        },
      ];

      const result = calculateOrdersDelta(quarterlyData);

      expect(result).toBe("0%");
    });

    it("should handle first quarter with orders and no previous quarter", () => {
      const quarterlyData: QuarterlyMetricOutput[] = [
        {
          quarter: "Q3 2025",
          brands: 5,
          locations: 100,
          activeSmartMenus: 5,
          orders: 1000,
          ordersQoQGrowth: 25,
        },
      ];

      const result = calculateOrdersDelta(quarterlyData);

      expect(result).toBe("+25.0%");
    });
  });

  describe("validateQuarterlyMetrics", () => {
    it("should validate correct data structure", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
        },
      ];

      const result = validateQuarterlyMetrics(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing quarterLabel", () => {
      const input = [
        {
          // Missing quarterLabel
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
        },
      ];

      const result = validateQuarterlyMetrics(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Item 0: Missing quarterLabel");
    });

    it("should detect invalid orders.count type", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          orders: { count: "1000", qoqGrowth: 200, qoqGrowthPercent: 25 }, // String instead of number
        },
      ];

      const result = validateQuarterlyMetrics(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Item 0: orders.count must be a number");
    });

    it("should detect multiple validation errors", () => {
      const input = [
        {
          // Missing quarterLabel
          orders: { count: "1000", qoqGrowth: 200, qoqGrowthPercent: 25 }, // Invalid type
        },
        {
          quarterLabel: "Q2 2025",
          locations: { count: "100", qoqGrowth: 20, qoqGrowthPercent: 25 }, // Invalid type
        },
      ];

      const result = validateQuarterlyMetrics(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain("Item 0: Missing quarterLabel");
      expect(result.errors).toContain("Item 0: orders.count must be a number");
      expect(result.errors).toContain(
        "Item 1: locations.count must be a number"
      );
    });
  });
});
