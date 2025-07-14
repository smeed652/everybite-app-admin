import { AlertCircle } from 'lucide-react';
import { AllergenType } from '../../../generated/graphql';
import { OptionToggleSection } from '../../../components/ui/OptionToggleSection';

interface Props {
  allergenOptions: AllergenType[];
  enableAllergens: boolean;
  onToggleAllergens: (v: boolean) => void;
  selectedAllergens: AllergenType[];
  onChangeSelectedAllergens: (v: AllergenType[]) => void;
  // toggleArrayItem is still accepted for backward compatibility but ignored.
  toggleArrayItem?: <T,>(arr: T[], v: T) => T[];
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
}: Props) {
  const formatLabel = (a: AllergenType) =>
    a.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <OptionToggleSection<AllergenType>
      icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
      title="Allergens"
      description="Enable allergen filters (select at least one allergen when enabled)"
      options={allergenOptions}
      enabled={enableAllergens}
      onToggleEnabled={onToggleAllergens}
      selected={selectedAllergens}
      onChangeSelected={onChangeSelectedAllergens}
      optionLabel={formatLabel}
    />
  );
}

export { AllergensSection };
