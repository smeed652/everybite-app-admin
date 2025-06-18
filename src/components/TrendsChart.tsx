import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from './ui/Skeleton';

interface Point {
  date: string; // ISO date
  value: number;
}

interface TrendsChartProps {
  data: Point[] | undefined;
  loading?: boolean;
  'data-testid'?: string;
}

export function TrendsChart({ data, loading, 'data-testid': testId }: TrendsChartProps) {
  if (loading) {
    return <Skeleton className="h-64 w-full" data-testid={testId} />;
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm" data-testid={testId}>
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} data-testid={testId} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          className="fill-muted-foreground text-xs"
        />
        <YAxis
          tickFormatter={(v) => `$${v / 1000}k`}
          width={40}
          className="fill-muted-foreground text-xs"
        />
        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
