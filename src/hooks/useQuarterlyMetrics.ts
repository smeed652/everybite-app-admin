import {
  endOfQuarter,
  format,
  isWithinInterval,
  startOfQuarter,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";

interface Widget {
  id: string;
  createdAt: string;
  publishedAt?: string | null;
  numberOfLocations?: number | null;
  // Add brand information when available
  brandName?: string | null;
}

interface QuarterlyData {
  quarter: string;
  brands: number;
  locations: number;
  activeSmartMenus: number;
  orders?: number;
  ordersQoQGrowth?: number;
}

interface OrdersData {
  quarter: string;
  total_orders: number;
}

export function useQuarterlyMetrics(widgets: Widget[]): {
  quarterlyData: QuarterlyData[];
  loading: boolean;
  error: string | null;
} {
  const [ordersData, setOrdersData] = useState<OrdersData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Fetch orders data from Lambda endpoint
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);

        // Get Lambda URL from environment or use a default
        const lambdaUrl =
          import.meta.env.VITE_LAMBDA_URL ||
          "https://ldfubm7l7k2hj4ln3pxtqylcwe0isjau.lambda-url.us-west-1.on.aws";

        const response = await fetch(`${lambdaUrl}/orders-per-quarter`);
        if (!response.ok) {
          throw new Error(`Failed to fetch orders data: ${response.status}`);
        }

        const data = await response.json();
        if (data.data && data.data.rows) {
          // Log the raw backend data for debugging
          console.log("Raw orders data from backend:", data.data.rows);
          const orders = data.data.rows.map((row: [string, string]) => {
            const quarterDate = new Date(row[0]);
            // Convert the Lambda's quarter start date to the frontend's quarter format
            // Lambda returns start of quarter, we need to format it as "QQQ yyyy"
            const year = quarterDate.getFullYear();
            const month = quarterDate.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            const quarterName = `Q${quarter} ${year}`;

            console.log(
              `Orders quarter mapping: ${row[0]} -> ${quarterName} (${row[1]} orders)`
            );

            return {
              quarter: quarterName,
              total_orders: parseInt(row[1], 10),
            };
          });
          setOrdersData(orders);
        }
      } catch (error) {
        console.error("Error fetching orders data:", error);
        setOrdersError(
          error instanceof Error ? error.message : "Failed to fetch orders data"
        );
        // Don't fail the entire component if orders data fails to load
        setOrdersData([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  return useMemo(() => {
    try {
      console.log(
        "useQuarterlyMetrics: calculating with widgets:",
        widgets.length
      );
      console.log("useQuarterlyMetrics: ordersData:", ordersData);
      console.log("useQuarterlyMetrics: ordersLoading:", ordersLoading);
      console.log("useQuarterlyMetrics: ordersError:", ordersError);

      // Get the last 4 quarters
      const now = new Date();
      const quarters: QuarterlyData[] = [];

      for (let i = 0; i < 4; i++) {
        const quarterStart = startOfQuarter(
          new Date(now.getFullYear(), now.getMonth() - i * 3, 1)
        );
        const quarterEnd = endOfQuarter(quarterStart);

        const quarterName = format(quarterStart, "QQQ yyyy");

        console.log(
          `Frontend quarter: ${quarterName} (${quarterStart.toISOString()} to ${quarterEnd.toISOString()})`
        );

        // Get widgets that were PUBLISHED in this quarter (not just created)
        const publishedInQuarter = widgets.filter((widget) => {
          if (!widget.publishedAt) return false;
          const publishedAt = new Date(widget.publishedAt);
          return isWithinInterval(publishedAt, {
            start: quarterStart,
            end: quarterEnd,
          });
        });

        // Calculate metrics for this quarter
        // Count unique brands for widgets PUBLISHED in this quarter
        const brands = new Set(
          publishedInQuarter.map((w) => w.brandName).filter(Boolean)
        ).size;
        // If brandName is not available, use unique widget IDs as a proxy
        const uniqueBrands =
          brands > 0
            ? brands
            : new Set(publishedInQuarter.map((w) => w.id)).size;

        // FIXED: Calculate locations for widgets that were PUBLISHED in this quarter
        const locations = publishedInQuarter.reduce(
          (sum, widget) => sum + (widget.numberOfLocations || 0),
          0
        );

        const activeSmartMenus = publishedInQuarter.length;

        // Find orders data for this quarter
        const quarterOrders = ordersData.find((o) => o.quarter === quarterName);
        const orders = quarterOrders?.total_orders;

        quarters.push({
          quarter: quarterName,
          brands: uniqueBrands,
          locations,
          activeSmartMenus,
          orders,
        });
      }

      // Calculate QoQ growth for orders
      quarters.forEach((quarter, index) => {
        if (
          index < quarters.length - 1 &&
          quarter.orders &&
          quarters[index + 1].orders
        ) {
          const current = quarter.orders;
          const previous = quarters[index + 1].orders;
          if (previous && previous > 0) {
            quarter.ordersQoQGrowth = ((current - previous) / previous) * 100;
          }
        }
      });

      console.log("useQuarterlyMetrics: final quarters data:", quarters);

      return {
        quarterlyData: quarters,
        loading: false, // Don't show loading state for the main component
        error: null, // Don't show error for the main component
      };
    } catch (error) {
      console.error("useQuarterlyMetrics: error in calculation:", error);
      return {
        quarterlyData: [],
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate quarterly metrics",
      };
    }
  }, [widgets, ordersData, ordersLoading, ordersError]);
}
