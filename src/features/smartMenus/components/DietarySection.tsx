import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Leaf, Utensils } from 'lucide-react';
import { DietType } from '../../../generated/graphql';

interface Props {
  dietOptions: DietType[];
  enableDiets: boolean;
  onToggleDiets: (v: boolean) => void;
  selectedDiets: DietType[];
  onChangeSelectedDiets: (v: DietType[]) => void;
  enableIngredients: boolean;
  onToggleIngredients: (v: boolean) => void;
  toggleArrayItem: <T,>(arr: T[], v: T) => T[];
}

/**
 * Dietary preferences + ingredients switches extracted from FeaturesPanel.
 * Keeps UI concerns isolated so parent stays below ESLint max-lines.
 */
export default function DietarySection({
  dietOptions,
  enableDiets,
  onToggleDiets,
  selectedDiets,
  onChangeSelectedDiets,
  enableIngredients,
  onToggleIngredients,
  toggleArrayItem,
}: Props) {
  return (
    <>
      {/* Dietary preferences */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4" /> Dietary Preferences
              {enableDiets && (
                <button
                  type="button"
                  onClick={() => onChangeSelectedDiets(dietOptions)}
                  className="text-xs underline text-blue-600 hover:text-blue-800"
                >
                  Select&nbsp;All
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Enable diet filters (select at least one diet when enabled)
            </p>
          </div>
          <Toggle checked={enableDiets} onChange={onToggleDiets} />
        </div>

        {enableDiets && (
          <div className="pl-6 grid grid-cols-2 gap-2">
            {dietOptions.map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedDiets.includes(d)}
                  onChange={() =>
                    onChangeSelectedDiets(toggleArrayItem(selectedDiets, d))
                  }
                />
                {d}
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Ingredients */}
      <SettingToggle
        icon={<Utensils className="h-4 w-4" />}
        title="Ingredients"
        description="Enable ingredients list per dish"
        checked={enableIngredients}
        onChange={onToggleIngredients}
      />
    </>
  );
}

export { DietarySection };
