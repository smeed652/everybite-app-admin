import { describe, expect, it } from "vitest";
import { transformQuarterlyData } from "../../business-logic/quarterly-metrics/transformers";

describe("Quarterly Data Transformation - Pure Business Logic", () => {
  describe("Data Structure Handling", () => {
    it("should transform complete quarterly metrics correctly", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          brands: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
          locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
        },
      ] as any;

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
      const input = [
        {
          quarterLabel: "Q3 2025",
          // Missing brands field
          locations: { count: 100, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5, qoqGrowthPercent: 66.7 },
        },
      ] as any;

      const result = transformQuarterlyData(input);

      expect(result[0].brands).toBe(5); // Should fall back to activeSmartMenus count
    });

    it("should handle missing brands and activeSmartMenus with zero fallback", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          // Missing both brands and activeSmartMenus
          locations: { count: 100, qoqGrowthPercent: 25 },
          orders: { count: 1000, qoqGrowthPercent: 25 },
        },
      ] as any;

      const result = transformQuarterlyData(input);

      expect(result[0].brands).toBe(0); // Should fall back to 0
    });

    it("should handle missing nested count fields", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          brands: {}, // Missing count
          locations: {}, // Missing count
          orders: {}, // Missing count
          activeSmartMenus: {}, // Missing count
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

    it("should handle null/undefined input gracefully", () => {
      expect(transformQuarterlyData(null as any)).toEqual([]);
      expect(transformQuarterlyData(undefined as any)).toEqual([]);
      expect(transformQuarterlyData([])).toEqual([]);
    });

    it("should handle malformed input gracefully", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          // Completely malformed - missing all expected fields
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
  });

  describe("Data Validation", () => {
    it("should ensure all required fields are present in output", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          brands: { count: 5 },
          locations: { count: 100 },
          orders: { count: 1000, qoqGrowthPercent: 25 },
          activeSmartMenus: { count: 5 },
        },
      ] as any;

      const result = transformQuarterlyData(input);

      expect(result[0]).toHaveProperty("quarter");
      expect(result[0]).toHaveProperty("brands");
      expect(result[0]).toHaveProperty("locations");
      expect(result[0]).toHaveProperty("activeSmartMenus");
      expect(result[0]).toHaveProperty("orders");
      expect(result[0]).toHaveProperty("ordersQoQGrowth");
    });

    it("should ensure numeric values are always numbers", () => {
      const input = [
        {
          quarterLabel: "Q3 2025",
          brands: { count: "5" }, // String instead of number
          locations: { count: null }, // Null instead of number
          orders: { count: undefined, qoqGrowthPercent: "25" }, // Undefined and string
          activeSmartMenus: { count: 5 },
        },
      ] as any;

      const result = transformQuarterlyData(input);

      expect(typeof result[0].brands).toBe("number");
      expect(typeof result[0].locations).toBe("number");
      expect(typeof result[0].orders).toBe("number");
      expect(typeof result[0].ordersQoQGrowth).toBe("number");
    });
  });
});
