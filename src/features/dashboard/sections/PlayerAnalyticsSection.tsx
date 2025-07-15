import { AlertTriangle } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ConcentricDonutChart } from "../components/ConcentricDonutChart";
import { DonutStatCard } from "../components/DonutStatCard";
import { LegendItem } from "../components/LegendItem";
import { usePlayerAnalytics } from "../hooks/usePlayerAnalytics";

/**
 * Section that displays feature-usage analytics across active SmartMenus.
 * Now displays both GraphQL and Metabase Lambda analytics.
 */
export function PlayerAnalyticsSection() {
  const {
    loading,
    error,
    totalActive,
    withImages,
    withCardLayout,
    withOrdering,
    withByo,
  } = usePlayerAnalytics();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Active SmartMenu Features</h2>

      {error && (
        <div className="p-4 flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle aria-hidden="true" className="h-4 w-4" /> Failed to
          load widget analytics
        </div>
      )}

      {/* Stat cards (GraphQL) */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">
          SmartMenu Features (GraphQL)
        </h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DonutStatCard
              title="Images"
              countOn={withImages}
              total={totalActive}
              color="#a855f7"
            />
            <DonutStatCard
              title="Card Layout"
              countOn={withCardLayout}
              total={totalActive}
              color="#7c3aed"
            />
            <DonutStatCard
              title="Ordering"
              countOn={withOrdering}
              total={totalActive}
              color="#5b21b6"
            />
            <DonutStatCard
              title="BYO"
              countOn={withByo}
              total={totalActive}
              color="#c084fc"
            />
          </div>
        )}
      </div>

      {/* Concentric donut (GraphQL) */}
      <Card className="p-4 flex items-center justify-center mt-6">
        {loading ? (
          <Skeleton className="h-64 w-64 rounded-full" />
        ) : (
          <ConcentricDonutChart
            total={totalActive}
            images={withImages}
            cardLayout={withCardLayout}
            ordering={withOrdering}
            byo={withByo}
          />
        )}
      </Card>

      {/* Legend */}
      {!loading && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
          <LegendItem color="#a855f7" label="Images" />
          <LegendItem color="#7c3aed" label="Card Layout" />
          <LegendItem color="#5b21b6" label="Ordering" />
          <LegendItem color="#c084fc" label="BYO" />
        </div>
      )}
    </section>
  );
}
