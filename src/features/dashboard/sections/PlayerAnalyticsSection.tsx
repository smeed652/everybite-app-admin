import { AlertTriangle } from 'lucide-react';

import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ConcentricDonutChart } from '../components/ConcentricDonutChart';
import { DonutStatCard } from '../components/DonutStatCard';
import { LegendItem } from '../components/LegendItem';
import { usePlayerAnalytics } from '../hooks/usePlayerAnalytics';

/**
 * Section that displays feature-usage analytics across active SmartMenus.
 * Purely composes sub-components; all data/logic lives in `usePlayerAnalytics`.
 */
export function PlayerAnalyticsSection() {
  const { loading, error, totalActive, withImages, withCardLayout, withOrdering, withByo } =
    usePlayerAnalytics();

  if (error) {
    return (
      <div className="p-4 flex items-center gap-2 text-red-600 text-sm">
        <AlertTriangle className="h-4 w-4" /> Failed to load widget analytics
      </div>
    );
  }

  if (loading) {
    return <Skeleton className="h-72" />;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Active SmartMenu Features</h2>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DonutStatCard title="Images" countOn={withImages} total={totalActive} color="#a855f7" />
        <DonutStatCard title="Card Layout" countOn={withCardLayout} total={totalActive} color="#7c3aed" />
        <DonutStatCard title="Ordering" countOn={withOrdering} total={totalActive} color="#5b21b6" />
        <DonutStatCard title="BYO" countOn={withByo} total={totalActive} color="#c084fc" />
      </div>

      {/* Concentric donut */}
      <Card className="p-4 flex items-center justify-center mt-6">
        <ConcentricDonutChart
          total={totalActive}
          images={withImages}
          cardLayout={withCardLayout}
          ordering={withOrdering}
          byo={withByo}
        />
      </Card>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
        <LegendItem color="#a855f7" label="Images" />
        <LegendItem color="#7c3aed" label="Card Layout" />
        <LegendItem color="#5b21b6" label="Ordering" />
        <LegendItem color="#c084fc" label="BYO" />
      </div>
    </section>
  );
}
