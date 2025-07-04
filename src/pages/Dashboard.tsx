import { gql, useQuery } from '@apollo/client';
import { MetricsCard } from '../components/MetricsCard';
import { subDays, isAfter } from 'date-fns';
import { PlayerAnalyticsSection } from '../features/dashboard/sections/PlayerAnalyticsSection';
import { AlertTriangle } from 'lucide-react';

const GET_ALL_WIDGETS = gql/* GraphQL */ `
  query GetAllWidgets {
    widgets {
      id
      createdAt
      publishedAt
    }
  }
`;

export default function Dashboard() {
  // fetch widgets
  const { data, loading, error } = useQuery(GET_ALL_WIDGETS, { fetchPolicy: 'cache-and-network' });

  const widgets = data?.widgets ?? [];
  const total = widgets.length;
  const active = widgets.filter((w: { publishedAt?: string | null }) => Boolean(w.publishedAt)).length;

  // compute 30-day trending deltas
  const now = new Date();
  const startCurrent = subDays(now, 30);
  const startPrev = subDays(startCurrent, 30);

  const createdCurr = widgets.filter((w: { createdAt: string }) => isAfter(new Date(w.createdAt), startCurrent)).length;
  const createdPrev = widgets.filter((w: { createdAt: string }) =>
    isAfter(new Date(w.createdAt), startPrev) && !isAfter(new Date(w.createdAt), startCurrent),
  ).length;

  const activeCurr = widgets.filter((w: { publishedAt?: string | null }) => w.publishedAt && isAfter(new Date(w.publishedAt), startCurrent)).length;
  const activePrev = widgets.filter((w: { publishedAt?: string | null }) =>
    w.publishedAt && isAfter(new Date(w.publishedAt), startPrev) && !isAfter(new Date(w.publishedAt), startCurrent),
  ).length;

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const v = ((curr - prev) / prev) * 100;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  };

  const totalDelta = pct(createdCurr, createdPrev);
  const activeDelta = pct(activeCurr, activePrev);

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center text-center space-y-2">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <p className="text-sm font-medium text-red-600">Failed to load dashboard metrics.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <MetricsCard
          title="SmartMenus"
          value={total.toLocaleString()}
          delta={totalDelta}
          loading={loading}
        />
        <MetricsCard
          title="Active SmartMenus"
          value={active.toLocaleString()}
          delta={activeDelta}
          loading={loading}
        />
      </div>

      <PlayerAnalyticsSection />
    </div>
  );
}
