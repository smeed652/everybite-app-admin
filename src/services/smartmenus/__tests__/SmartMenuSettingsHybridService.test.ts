import { beforeEach, describe, expect, it, vi } from "vitest";
import { SmartMenuSettingsHybridService } from "../SmartMenuSettingsHybridService";

// Mock the Lambda client
vi.mock("../../../lib/datawarehouse-lambda-apollo", () => ({
  lambdaClient: {
    query: vi.fn(),
  },
}));

// Mock the main API client
vi.mock("../../../lib/api-graphql-apollo", () => ({
  client: {
    query: vi.fn(),
  },
}));

describe("SmartMenuSettingsHybridService", () => {
  let service: SmartMenuSettingsHybridService;

  beforeEach(() => {
    service = new SmartMenuSettingsHybridService();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("Data Structure Contract Tests", () => {
    it("should handle Lambda response with complete quarterly metrics structure", async () => {
      const mockLambdaResponse = {
        data: {
          quarterlyMetrics: [
            {
              quarter: "2025-07-01T00:00:00Z",
              year: 2025,
              quarterLabel: "Q3 2025",
              brands: {
                count: 0,
                qoqGrowth: -5,
                qoqGrowthPercent: -100,
              },
              locations: {
                count: 0,
                qoqGrowth: -415,
                qoqGrowthPercent: -100,
              },
              orders: {
                count: 12150,
                qoqGrowth: -33779,
                qoqGrowthPercent: -73.54,
              },
              activeSmartMenus: {
                count: 0,
                qoqGrowth: -5,
                qoqGrowthPercent: -100,
              },
              totalRevenue: {
                amount: 0,
                qoqGrowth: 0,
                qoqGrowthPercent: 0,
              },
            },
          ],
        },
      };

      const { lambdaClient } = await import(
        "../../../lib/datawarehouse-lambda-apollo"
      );
      if (lambdaClient) {
        vi.mocked(lambdaClient.query).mockResolvedValue({
          ...mockLambdaResponse,
          loading: false,
          networkStatus: 7,
        } as any);
      }

      const result = await service.getSmartMenuSettings();

      expect(result.quarterlyMetrics).toHaveLength(1);
      expect(result.quarterlyMetrics[0]).toMatchObject({
        quarter: "2025-07-01T00:00:00Z",
        year: 2025,
        quarterLabel: "Q3 2025",
        brands: { count: 0, qoqGrowth: -5, qoqGrowthPercent: -100 },
        locations: { count: 0, qoqGrowth: -415, qoqGrowthPercent: -100 },
        orders: { count: 12150, qoqGrowth: -33779, qoqGrowthPercent: -73.54 },
        activeSmartMenus: { count: 0, qoqGrowth: -5, qoqGrowthPercent: -100 },
        totalRevenue: { amount: 0, qoqGrowth: 0, qoqGrowthPercent: 0 },
      });
    });

    it("should handle Lambda response with missing optional fields", async () => {
      const mockLambdaResponse = {
        data: {
          quarterlyMetrics: [
            {
              quarter: "2025-07-01T00:00:00Z",
              year: 2025,
              quarterLabel: "Q3 2025",
              // Missing brands field
              locations: {
                count: 5,
                qoqGrowth: 10,
                qoqGrowthPercent: 20,
              },
              orders: {
                count: 100,
                qoqGrowth: 20,
                qoqGrowthPercent: 25,
              },
              activeSmartMenus: {
                count: 2,
                qoqGrowth: 1,
                qoqGrowthPercent: 100,
              },
              // Missing totalRevenue field
            },
          ],
        },
      };

      const { lambdaClient } = await import(
        "../../../lib/datawarehouse-lambda-apollo"
      );
      if (lambdaClient) {
        vi.mocked(lambdaClient.query).mockResolvedValue({
          ...mockLambdaResponse,
          loading: false,
          networkStatus: 7,
        } as any);
      }

      const result = await service.getSmartMenuSettings();

      // Should not crash and should handle missing fields gracefully
      expect(result.quarterlyMetrics).toHaveLength(1);
      expect(result.quarterlyMetrics[0]).toMatchObject({
        quarter: "2025-07-01T00:00:00Z",
        year: 2025,
        quarterLabel: "Q3 2025",
        locations: { count: 5, qoqGrowth: 10, qoqGrowthPercent: 20 },
        orders: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
        activeSmartMenus: { count: 2, qoqGrowth: 1, qoqGrowthPercent: 100 },
      });
    });

    it("should handle empty quarterly metrics array", async () => {
      const mockLambdaResponse = {
        data: {
          quarterlyMetrics: [],
        },
      };

      const { lambdaClient } = await import(
        "../../../lib/datawarehouse-lambda-apollo"
      );
      if (lambdaClient) {
        vi.mocked(lambdaClient.query).mockResolvedValue({
          ...mockLambdaResponse,
          loading: false,
          networkStatus: 7,
        } as any);
      }

      const result = await service.getSmartMenuSettings();

      expect(result.quarterlyMetrics).toEqual([]);
    });

    it("should handle Lambda errors gracefully", async () => {
      const { lambdaClient } = await import(
        "../../../lib/datawarehouse-lambda-apollo"
      );
      if (lambdaClient) {
        vi.mocked(lambdaClient.query).mockRejectedValue(
          new Error("Lambda error")
        );
      }

      const result = await service.getSmartMenuSettings();

      // Should return empty quarterly metrics when Lambda fails
      expect(result.quarterlyMetrics).toEqual([]);
    });
  });

  describe("Data Transformation Tests", () => {
    it("should transform quarterly metrics to expected frontend format", async () => {
      const mockLambdaResponse = {
        data: {
          quarterlyMetrics: [
            {
              quarter: "2025-07-01T00:00:00Z",
              year: 2025,
              quarterLabel: "Q3 2025",
              brands: { count: 5, qoqGrowth: 2, qoqGrowthPercent: 66.7 },
              locations: { count: 100, qoqGrowth: 20, qoqGrowthPercent: 25 },
              orders: { count: 1000, qoqGrowth: 200, qoqGrowthPercent: 25 },
              activeSmartMenus: {
                count: 5,
                qoqGrowth: 2,
                qoqGrowthPercent: 66.7,
              },
              totalRevenue: {
                amount: 50000,
                qoqGrowth: 10000,
                qoqGrowthPercent: 25,
              },
            },
          ],
        },
      };

      const { lambdaClient } = await import(
        "../../../lib/datawarehouse-lambda-apollo"
      );
      if (lambdaClient) {
        vi.mocked(lambdaClient.query).mockResolvedValue({
          ...mockLambdaResponse,
          loading: false,
          networkStatus: 7,
        } as any);
      }

      const result = await service.getSmartMenuSettings();

      // Verify the transformation preserves all required fields
      const quarterlyMetric = result.quarterlyMetrics[0];
      expect(quarterlyMetric).toHaveProperty("quarter");
      expect(quarterlyMetric).toHaveProperty("year");
      expect(quarterlyMetric).toHaveProperty("quarterLabel");
      expect(quarterlyMetric).toHaveProperty("brands");
      expect(quarterlyMetric).toHaveProperty("locations");
      expect(quarterlyMetric).toHaveProperty("orders");
      expect(quarterlyMetric).toHaveProperty("activeSmartMenus");
      expect(quarterlyMetric).toHaveProperty("totalRevenue");

      // Verify nested structure
      expect(quarterlyMetric.brands).toHaveProperty("count");
      expect(quarterlyMetric.brands).toHaveProperty("qoqGrowth");
      expect(quarterlyMetric.brands).toHaveProperty("qoqGrowthPercent");
    });
  });
});
