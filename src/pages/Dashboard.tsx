import { gql, useQuery } from '@apollo/client';
import { MetricsCard } from '../components/MetricsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { AlertTriangle } from 'lucide-react';

const GET_DASHBOARD_METRICS = gql/* GraphQL */ `
  query DashboardMetrics {
    totalRevenue
    newCustomers
    activeAccounts
    growthRate
  }
`;

export default function Dashboard() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_METRICS, { fetchPolicy: 'cache-and-network' });

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Revenue"
          value={`$${data?.totalRevenue?.toLocaleString()}`}
          delta="+12.5%"
          loading={loading}
        />
        <MetricsCard
          title="New Customers"
          value={data?.newCustomers?.toLocaleString()}
          delta="-20%"
          loading={loading}
        />
        <MetricsCard
          title="Active Accounts"
          value={data?.activeAccounts?.toLocaleString()}
          delta="+12.5%"
          loading={loading}
        />
        <MetricsCard
          title="Growth Rate"
          value={`${data?.growthRate ?? 0}%`}
          delta="+4.5%"
          loading={loading}
        />
      </div>

      {/* Placeholder for chart */}
      <div className="rounded-lg border p-6 h-64 flex items-center justify-center">
        {loading ? <Skeleton className="h-40 w-full" /> : <p className="text-muted-foreground">Chart coming soon…</p>}
      </div>
    </div>
  );
}
