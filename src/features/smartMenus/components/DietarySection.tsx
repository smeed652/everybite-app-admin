import { OptionToggleSection } from '../../../components/ui/OptionToggleSection';
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
  toggleArrayItem?: <T,>(arr: T[], v: T) => T[];
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
}: Props) {
  return (
    <>
      {/* Dietary preferences */}
      <OptionToggleSection<DietType>
        icon={<Leaf className="h-4 w-4" />}
        title="Dietary Preferences"
        description="Enable diet filters (select at least one diet when enabled)"
        options={dietOptions}
        enabled={enableDiets}
        onToggleEnabled={onToggleDiets}
        selected={selectedDiets}
        onChangeSelected={onChangeSelectedDiets}
        optionLabel={(d) => d.charAt(0) + d.slice(1).toLowerCase()}
      />

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
