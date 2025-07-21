/**
 * Dashboard Business Logic Calculations Tests
 */

import { describe, expect, it } from "vitest";
import {
  calculateDashboardAnalytics,
  calculateDashboardMetrics,
  calculateDashboardPerformance,
  calculateDashboardSummary,
  calculatePercentageChange,
  convertToDashboardMetrics,
  createTimePeriod,
  filterWidgetsByTimePeriod,
} from "../calculations";

describe("Dashboard Business Logic Calculations", () => {
  const mockWidgets = [
    {
      id: "1",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      numberOfLocations: 5,
    },
    {
      id: "2",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      numberOfLocations: 3,
    },
    {
      id: "3",
      createdAt: new Date().toISOString(), // today
      numberOfLocations: 0,
    },
  ];

  const mockAnalytics = {
    totalActive: 2,
    withImages: 1,
    withCardLayout: 2,
    withOrdering: 1,
    withByo: 0,
  };

  describe("calculatePercentageChange", () => {
    it("should calculate positive percentage change", () => {
      const result = calculatePercentageChange(120, 100);
      expect(result).toBe("+20.0%");
    });

    it("should calculate negative percentage change", () => {
      const result = calculatePercentageChange(80, 100);
      expect(result).toBe("-20.0%");
    });

    it("should handle zero previous value", () => {
      const result = calculatePercentageChange(50, 0);
      expect(result).toBe("+100%");
    });

    it("should handle zero current value with zero previous", () => {
      const result = calculatePercentageChange(0, 0);
      expect(result).toBe("0%");
    });
  });

  describe("createTimePeriod", () => {
    it("should create time period with default days", () => {
      const result = createTimePeriod();
      expect(result.days).toBe(30);
      expect(result.label).toBe("30-day period");
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });

    it("should create time period with custom days", () => {
      const result = createTimePeriod(7);
      expect(result.days).toBe(7);
      expect(result.label).toBe("7-day period");
    });
  });

  describe("filterWidgetsByTimePeriod", () => {
    it("should filter widgets by createdAt", () => {
      const timePeriod = createTimePeriod(30);
      const result = filterWidgetsByTimePeriod(
        mockWidgets,
        timePeriod,
        "createdAt"
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it("should filter widgets by publishedAt", () => {
      const timePeriod = createTimePeriod(30);
      const result = filterWidgetsByTimePeriod(
        mockWidgets,
        timePeriod,
        "publishedAt"
      );
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("calculateDashboardMetrics", () => {
    it("should calculate dashboard metrics successfully", () => {
      const result = calculateDashboardMetrics(mockWidgets);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.total).toBe(3);
        expect(result.data.active).toBe(2);
        expect(result.data.totalLocations).toBe(8);
        expect(result.data.trends).toBeDefined();
      }
    });

    it("should handle empty widgets array", () => {
      const result = calculateDashboardMetrics([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No valid widgets found");
    });

    it("should handle invalid input", () => {
      const result = calculateDashboardMetrics(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Widgets must be an array");
    });
  });

  describe("calculateDashboardAnalytics", () => {
    it("should calculate dashboard analytics successfully", () => {
      const result = calculateDashboardAnalytics(mockWidgets, mockAnalytics);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.analytics.totalActive).toBe(2);
        expect(result.data.analytics.withImages).toBe(1);
        expect(result.data.percentages.images).toBe(50);
        expect(result.data.percentages.cardLayout).toBe(100);
      }
    });

    it("should handle missing analytics data", () => {
      const result = calculateDashboardAnalytics(mockWidgets, null);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Analytics data is required");
    });
  });

  describe("calculateDashboardSummary", () => {
    it("should calculate dashboard summary successfully", () => {
      const result = calculateDashboardSummary(mockWidgets, mockAnalytics);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.totalSmartMenus).toBe(3);
        expect(result.data.activeSmartMenus).toBe(2);
        expect(result.data.totalLocations).toBe(8);
        expect(result.data.activationRate).toBeCloseTo(66.67, 1);
        expect(result.data.averageLocationsPerMenu).toBeCloseTo(2.67, 1);
      }
    });

    it("should handle empty widgets array", () => {
      const result = calculateDashboardSummary([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No valid widgets found");
    });
  });

  describe("calculateDashboardPerformance", () => {
    it("should calculate dashboard performance successfully", () => {
      const result = calculateDashboardPerformance(mockWidgets, mockAnalytics);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.growthRate).toBeDefined();
        expect(result.data.activationTrend).toBeDefined();
        expect(result.data.locationGrowth).toBeDefined();
        expect(result.data.featureAdoption).toBeDefined();
      }
    });

    it("should handle empty widgets array", () => {
      const result = calculateDashboardPerformance([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No valid widgets found");
    });
  });

  describe("convertToDashboardMetrics", () => {
    it("should convert dashboard metrics result to UI format", () => {
      const metricsResult = {
        total: 3,
        active: 2,
        totalLocations: 8,
        trends: {
          total: {
            current: 2,
            previous: 1,
            delta: "+100.0%",
            percentage: 100,
            isPositive: true,
          },
          active: {
            current: 1,
            previous: 0,
            delta: "+100%",
            percentage: 100,
            isPositive: true,
          },
          locations: {
            current: 8,
            previous: 3,
            delta: "+166.7%",
            percentage: 166.7,
            isPositive: true,
          },
        },
      };

      const result = convertToDashboardMetrics(metricsResult);

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.totalLocations).toBe(8);
      expect(result.totalDelta).toBe("+100.0%");
      expect(result.activeDelta).toBe("+100%");
      expect(result.locationsDelta).toBe("+166.7%");
    });
  });
});
