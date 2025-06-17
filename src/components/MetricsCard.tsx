import { Card } from './ui/Card';
import { Skeleton } from './ui/Skeleton';
import { cn } from '../lib/utils';

interface MetricsCardProps {
  title: string;
  value?: string | number;
  delta?: string;
  loading?: boolean;
}

export function MetricsCard({ title, value, delta, loading }: MetricsCardProps) {
  return (
    <Card className="p-4 space-y-1">
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
      )}
      {delta && <span className={cn('text-xs', delta.startsWith('-') ? 'text-red-600' : 'text-green-600')}>{delta}</span>}
    </Card>
  );
}
