import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { Activity } from 'lucide-react';

interface Props {
  enableNutrients: boolean;
  onToggleNutrients: (v: boolean) => void;
  enableCalories: boolean;
  onToggleCalories: (v: boolean) => void;
}

/**
 * Nutrients toggle and nested calorie checkbox wrapped in a single Card so that
 * the header row and dependent controls live in the same visual panel –
 * matching the AllergensSection grouping pattern.
 */
export default function NutrientsSection({
  enableNutrients,
  onToggleNutrients,
  enableCalories,
  onToggleCalories,
}: Props) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4" /> Nutrients
          </p>
          <p className="text-sm text-muted-foreground">
            Enable filtering by protein, fat &amp; carb ranges
          </p>
        </div>
        <Toggle checked={enableNutrients} onChange={onToggleNutrients} />
      </div>

      {enableNutrients && (
        <div className="pl-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={enableCalories}
              onChange={() => onToggleCalories(!enableCalories)}
            />
            Macro&nbsp;Nutrients
          </label>
        </div>
      )}
    </Card>
  );
}

export { NutrientsSection };
