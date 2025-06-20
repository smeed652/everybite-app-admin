import { Card } from '../../../components/ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DonutStatCardProps {
  title: string;
  countOn: number;
  total: number;
  color: string;
}

/**
 * Small donut statistic card used by PlayerAnalyticsSection.
 * Displays a single-ring donut plus percentage text.
 */
export function DonutStatCard({ title, countOn, total, color }: DonutStatCardProps) {
  const data = [
    { name: 'On', value: countOn },
    { name: 'Off', value: Math.max(total - countOn, 0) },
  ];

  const percent = total > 0 ? Math.round((countOn / total) * 100) : 0;

  return (
    <Card className="p-4 flex flex-col items-center justify-center space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={50}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
          <Tooltip formatter={(v: number) => `${v} of ${total}`} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-sm font-semibold">{percent}%</p>
    </Card>
  );
}
