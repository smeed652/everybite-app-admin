import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";

interface QuarterlyData {
  quarter: string;
  brands: number;
  locations: number;
  activeSmartMenus: number;
  orders?: number;
  ordersQoQGrowth?: number;
}

interface QuarterlyMetricsTableProps {
  data: QuarterlyData[];
  loading?: boolean;
  error?: string | null;
}

export function QuarterlyMetricsTable({
  data,
  loading = false,
  error = null,
}: QuarterlyMetricsTableProps) {
  console.log("QuarterlyMetricsTable render:", { data, loading, error });
  console.log(
    "QuarterlyMetricsTable quarter values:",
    data?.map((item) => item.quarter)
  );

  if (loading) {
    console.log("QuarterlyMetricsTable: showing loading state");
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    console.log("QuarterlyMetricsTable: showing error state:", error);
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="text-sm font-medium">
            Failed to load quarterly metrics
          </p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    console.log("QuarterlyMetricsTable: showing empty state");
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No quarterly data available</p>
        </div>
      </Card>
    );
  }

  console.log("QuarterlyMetricsTable: rendering with data:", data);

  const calculateGrowth = (
    current: number,
    previous: number
  ): {
    percentage: string;
    isPositive: boolean;
    isZero: boolean;
  } => {
    if (previous === 0) {
      return {
        percentage: current > 0 ? "+∞" : "0%",
        isPositive: current > 0,
        isZero: current === 0,
      };
    }
    const growth = ((current - previous) / previous) * 100;
    return {
      percentage: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
      isPositive: growth >= 0,
      isZero: growth === 0,
    };
  };

  const getGrowthIcon = (isPositive: boolean, isZero: boolean) => {
    if (isZero)
      return (
        <Minus
          className="h-4 w-4 text-muted-foreground"
          aria-label="No change"
        />
      );
    return isPositive ? (
      <TrendingUp
        className="h-4 w-4 text-green-600"
        aria-label="Positive growth"
      />
    ) : (
      <TrendingDown
        className="h-4 w-4 text-red-600"
        aria-label="Negative growth"
      />
    );
  };

  const getGrowthColor = (isPositive: boolean, isZero: boolean) => {
    if (isZero) return "text-muted-foreground";
    return isPositive ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 id="quarterly-metrics-title" className="text-lg font-semibold">
            Quarterly Growth Metrics
          </h3>
          <p className="text-sm text-muted-foreground">
            Year-over-year business performance for investment reporting
          </p>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full"
            aria-labelledby="quarterly-metrics-title"
            role="table"
          >
            <caption className="sr-only">
              Quarterly Growth Metrics Table
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th
                  scope="col"
                  className="text-left py-3 px-4 font-medium text-sm"
                >
                  Quarter
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 font-medium text-sm"
                >
                  Brands
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 font-medium text-sm"
                >
                  QoQ Growth
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 font-medium text-sm"
                >
                  Locations
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 font-medium text-sm"
                >
                  QoQ Growth
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 font-medium text-sm"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="text-right py-3 px-4 font-medium text-sm"
                >
                  QoQ Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((quarter, index) => {
                const prevQuarter =
                  index < data.length - 1 ? data[index + 1] : null;

                const locationsGrowth = prevQuarter
                  ? calculateGrowth(quarter.locations, prevQuarter.locations)
                  : { percentage: "—", isPositive: false, isZero: true };

                const brandsGrowth = prevQuarter
                  ? calculateGrowth(
                      quarter.activeSmartMenus,
                      prevQuarter.activeSmartMenus
                    )
                  : { percentage: "—", isPositive: false, isZero: true };

                const ordersGrowth =
                  prevQuarter && quarter.orders && prevQuarter.orders
                    ? calculateGrowth(quarter.orders, prevQuarter.orders)
                    : { percentage: "—", isPositive: false, isZero: true };

                return (
                  <tr
                    key={quarter.quarter}
                    className="border-b border-border/50 hover:bg-muted/50"
                  >
                    <th scope="row" className="py-3 px-4 font-medium text-left">
                      {quarter.quarter}
                    </th>

                    {/* Brands */}
                    <td className="py-3 px-4 text-right font-mono">
                      {quarter.activeSmartMenus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getGrowthIcon(
                          brandsGrowth.isPositive,
                          brandsGrowth.isZero
                        )}
                        <span
                          className={`text-sm font-medium ${getGrowthColor(brandsGrowth.isPositive, brandsGrowth.isZero)}`}
                        >
                          {brandsGrowth.percentage}
                        </span>
                      </div>
                    </td>

                    {/* Locations */}
                    <td className="py-3 px-4 text-right font-mono">
                      {quarter.locations.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getGrowthIcon(
                          locationsGrowth.isPositive,
                          locationsGrowth.isZero
                        )}
                        <span
                          className={`text-sm font-medium ${getGrowthColor(locationsGrowth.isPositive, locationsGrowth.isZero)}`}
                        >
                          {locationsGrowth.percentage}
                        </span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-3 px-4 text-right font-mono">
                      {quarter.orders?.toLocaleString() || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getGrowthIcon(
                          ordersGrowth.isPositive,
                          ordersGrowth.isZero
                        )}
                        <span
                          className={`text-sm font-medium ${getGrowthColor(ordersGrowth.isPositive, ordersGrowth.isZero)}`}
                        >
                          {ordersGrowth.percentage}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
