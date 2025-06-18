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
    <Card data-testid="metrics-card" className="p-4 space-y-1">
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
      )}
      {delta && (
        <span
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            delta.startsWith('-') ? 'text-red-600' : 'text-green-600',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn('h-3 w-3', delta.startsWith('-') && 'rotate-180')}
          >
            <path
              fillRule="evenodd"
              d="M12 5.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V6a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          {delta}
        </span>
      )}
    </Card>
  );
}
