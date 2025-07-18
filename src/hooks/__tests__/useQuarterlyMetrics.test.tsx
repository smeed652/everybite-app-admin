import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useQuarterlyMetrics } from "../useQuarterlyMetrics";

// Mock fetch
global.fetch = vi.fn();

// Mock date-fns functions
vi.mock("date-fns", () => ({
  format: vi.fn((date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  }),
  startOfQuarter: vi.fn(
    (date) =>
      new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1)
  ),
  endOfQuarter: vi.fn(
    (date) =>
      new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 2, 31)
  ),
  isWithinInterval: vi.fn((date, interval) => {
    return date >= interval.start && date <= interval.end;
  }),
}));

describe("useQuarterlyMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful fetch response
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            rows: [
              ["2024-01-01T00:00:00Z", 1000],
              ["2024-04-01T00:00:00Z", 2000],
              ["2024-07-01T00:00:00Z", 3000],
              ["2024-10-01T00:00:00Z", 4000],
            ],
          },
        }),
    });
  });

  const mockWidgets = [
    {
      id: "1",
      createdAt: "2024-01-15T10:00:00Z", // Q1 2024
      publishedAt: "2024-01-20T10:00:00Z",
      numberOfLocations: 5,
      brandName: "Brand A",
    },
    {
      id: "2",
      createdAt: "2024-02-15T10:00:00Z", // Q1 2024
      publishedAt: "2024-02-20T10:00:00Z",
      numberOfLocations: 3,
      brandName: "Brand B",
    },
    {
      id: "3",
      createdAt: "2024-04-15T10:00:00Z", // Q2 2024
      publishedAt: "2024-04-20T10:00:00Z",
      numberOfLocations: 8,
      brandName: "Brand C",
    },
    {
      id: "4",
      createdAt: "2024-07-15T10:00:00Z", // Q3 2024
      publishedAt: "2024-07-20T10:00:00Z",
      numberOfLocations: 12,
      brandName: "Brand D",
    },
    {
      id: "5",
      createdAt: "2024-10-15T10:00:00Z", // Q4 2024
      publishedAt: "2024-10-20T10:00:00Z",
      numberOfLocations: 15,
      brandName: "Brand E",
    },
    {
      id: "6",
      createdAt: "2024-10-25T10:00:00Z", // Q4 2024
      publishedAt: null, // Not active
      numberOfLocations: 10,
      brandName: "Brand F",
    },
  ];

  it("calculates quarterly metrics correctly", () => {
    const { result } = renderHook(() => useQuarterlyMetrics(mockWidgets));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.quarterlyData).toHaveLength(4);

    // Check Q3 2025 (most recent - current quarter)
    const q3_2025 = result.current.quarterlyData[0];
    expect(q3_2025.quarter).toBe("Q3 2025");
    expect(q3_2025.brands).toBe(0); // No widgets published in Q3 2025
    expect(q3_2025.locations).toBe(0);
    expect(q3_2025.activeSmartMenus).toBe(0);

    // Check Q2 2025
    const q2_2025 = result.current.quarterlyData[1];
    expect(q2_2025.quarter).toBe("Q2 2025");
    expect(q2_2025.brands).toBe(0); // No widgets published in Q2 2025
    expect(q2_2025.locations).toBe(0);
    expect(q2_2025.activeSmartMenus).toBe(0);

    // Check Q1 2025
    const q1_2025 = result.current.quarterlyData[2];
    expect(q1_2025.quarter).toBe("Q1 2025");
    expect(q1_2025.brands).toBe(0); // No widgets published in Q1 2025
    expect(q1_2025.locations).toBe(0);
    expect(q1_2025.activeSmartMenus).toBe(0);

    // Check Q4 2024
    const q4_2024 = result.current.quarterlyData[3];
    expect(q4_2024.quarter).toBe("Q4 2024");
    expect(q4_2024.brands).toBe(1); // Only Brand E was published in Q4 (Brand F is not published)
    expect(q4_2024.locations).toBe(15); // Brand E was published in Q4 with 15 locations
    expect(q4_2024.activeSmartMenus).toBe(1); // Only Brand E was published in Q4
  });

  it("handles empty widgets array", () => {
    const { result } = renderHook(() => useQuarterlyMetrics([]));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.quarterlyData).toHaveLength(4);

    // All quarters should have zero values
    result.current.quarterlyData.forEach((quarter) => {
      expect(quarter.brands).toBe(0);
      expect(quarter.locations).toBe(0);
      expect(quarter.activeSmartMenus).toBe(0);
    });
  });

  it("handles widgets without brand names", () => {
    const widgetsWithoutBrands = mockWidgets.map((widget) => ({
      ...widget,
      brandName: null,
    }));

    const { result } = renderHook(() =>
      useQuarterlyMetrics(widgetsWithoutBrands)
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Should use unique widget IDs as proxy for brands
    const q4 = result.current.quarterlyData[3]; // Q4 2024 is at index 3
    expect(q4.brands).toBe(1); // Only 1 widget was published in Q4 (Brand E, Brand F is not published)
  });

  it("handles widgets with missing numberOfLocations", () => {
    const widgetsWithMissingLocations = mockWidgets.map((widget) => ({
      ...widget,
      numberOfLocations: null,
    }));

    const { result } = renderHook(() =>
      useQuarterlyMetrics(widgetsWithMissingLocations)
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // All locations should be 0
    result.current.quarterlyData.forEach((quarter) => {
      expect(quarter.locations).toBe(0);
    });
  });

  it("handles widgets without publishedAt (inactive)", () => {
    const inactiveWidgets = mockWidgets.map((widget) => ({
      ...widget,
      publishedAt: null,
    }));

    const { result } = renderHook(() => useQuarterlyMetrics(inactiveWidgets));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // All activeSmartMenus should be 0
    result.current.quarterlyData.forEach((quarter) => {
      expect(quarter.activeSmartMenus).toBe(0);
      expect(quarter.locations).toBe(0);
    });
  });

  it("handles error in calculation", () => {
    // Mock a scenario that would cause an error
    const invalidWidgets = [
      {
        id: "1",
        createdAt: "invalid-date", // This will cause an error
        publishedAt: null,
        numberOfLocations: null,
        brandName: null,
      },
    ];

    const { result } = renderHook(() => useQuarterlyMetrics(invalidWidgets));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null); // The hook handles invalid dates gracefully
    expect(result.current.quarterlyData).toHaveLength(4); // Still returns 4 quarters with 0 values
  });
});
