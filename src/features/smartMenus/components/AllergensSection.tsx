import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { AlertCircle } from 'lucide-react';
import { AllergenType } from '../../../generated/graphql';

interface Props {
  allergenOptions: AllergenType[];
  enableAllergens: boolean;
  onToggleAllergens: (v: boolean) => void;
  selectedAllergens: AllergenType[];
  onChangeSelectedAllergens: (v: AllergenType[]) => void;
  toggleArrayItem: <T,>(arr: T[], v: T) => T[];
}

/**
 * Allergens switches extracted from FeaturesPanel to reduce file size.
 */
export default function AllergensSection({
  allergenOptions,
  enableAllergens,
  onToggleAllergens,
  selectedAllergens,
  onChangeSelectedAllergens,
  toggleArrayItem,
}: Props) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-4 w-4" /> Allergens
            {enableAllergens && (
              <button
                type="button"
                onClick={() => onChangeSelectedAllergens(allergenOptions)}
                className="text-xs underline text-blue-600 hover:text-blue-800"
              >
                Select&nbsp;All
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Enable allergen filters (select at least one allergen when enabled)
          </p>
        </div>
        <Toggle checked={enableAllergens} onChange={onToggleAllergens} />
      </div>

      {enableAllergens && (
        <div className="pl-6 grid grid-cols-2 gap-2">
          {allergenOptions.map((a) => (
            <label key={a.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selectedAllergens.includes(a)}
                onChange={() =>
                  onChangeSelectedAllergens(
                    toggleArrayItem(selectedAllergens, a)
                  )
                }
              />
              {a.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}

export { AllergensSection };
