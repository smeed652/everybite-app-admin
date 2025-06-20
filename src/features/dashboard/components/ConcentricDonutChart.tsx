import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ConcentricDonutChartProps {
  total: number;
  images: number;
  cardLayout: number;
  ordering: number;
  byo: number;
}

/**
 * Concentric donut with 4 rings (outer→inner):
 * 1. BYO, 2. Images, 3. Card Layout, 4. Ordering
 */
export function ConcentricDonutChart({ total, images, cardLayout, ordering, byo }: ConcentricDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        {/* BYO */}
        <Pie
          data={[{ name: 'BYO On', value: byo }, { name: 'BYO Off', value: total - byo }]}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          innerRadius={90}
          outerRadius={110}
          strokeWidth={0}
        >
          <Cell fill="#c084fc" />
          <Cell fill="#e5e7eb" />
        </Pie>
        {/* Images */}
        <Pie
          data={[{ name: 'Images On', value: images }, { name: 'Images Off', value: total - images }]}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          innerRadius={70}
          outerRadius={88}
          strokeWidth={0}
        >
          <Cell fill="#a855f7" />
          <Cell fill="#e5e7eb" />
        </Pie>
        {/* Card layout */}
        <Pie
          data={[{ name: 'Card Layout', value: cardLayout }, { name: 'Other Layout', value: total - cardLayout }]}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          innerRadius={50}
          outerRadius={68}
          strokeWidth={0}
        >
          <Cell fill="#7c3aed" />
          <Cell fill="#e5e7eb" />
        </Pie>
        {/* Ordering */}
        <Pie
          data={[{ name: 'Ordering On', value: ordering }, { name: 'Ordering Off', value: total - ordering }]}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          innerRadius={30}
          outerRadius={48}
          strokeWidth={0}
        >
          <Cell fill="#5b21b6" />
          <Cell fill="#e5e7eb" />
        </Pie>
        <Tooltip formatter={(v: number) => `${v} of ${total}`} labelFormatter={(l) => String(l)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
