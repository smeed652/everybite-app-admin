import { useEffect, useMemo, useState } from 'react';
import { Widget, DietType, AllergenType } from '../../../generated/graphql';
import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Input } from '../../../components/ui/Input';
import { Activity, Hammer, ShoppingCart } from 'lucide-react';

import DietarySection from './DietarySection';
import AllergensSection from './AllergensSection';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface FeaturesPanelProps {
  widget: Widget;
  onFieldChange: (diff: Record<string, unknown>) => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const toggleArrayItem = <T,>(arr: T[], v: T): T[] =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const DIET_OPTIONS: DietType[] = [
  DietType.Vegetarian,
  DietType.Pescatarian,
  DietType.Vegan,
];

const ALLERGEN_OPTIONS: AllergenType[] = [
  AllergenType.Wheat,
  AllergenType.Dairy,
  AllergenType.Egg,
  AllergenType.Fish,
  AllergenType.Shellfish,
  AllergenType.TreeNut,
  AllergenType.Peanut,
  AllergenType.Sesame,
  AllergenType.Soy,
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function FeaturesPanel({
  widget,
  onFieldChange,
}: FeaturesPanelProps) {
  /* ---------- dietary / ingredients ------------------------------- */
  const [selectedDiets, setSelectedDiets] = useState<DietType[]>(
    widget.supportedDietaryPreferences ?? []
  );
  const [enableDiets, setEnableDiets] = useState(selectedDiets.length > 0);

  const [enableIngredients, setEnableIngredients] = useState(
    widget.displayIngredients
  );

  /* ---------- allergens ------------------------------------------- */
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>(
    widget.supportedAllergens ?? []
  );
  const [enableAllergens, setEnableAllergens] = useState(
    selectedAllergens.length > 0
  );

  /* ---------- nutrients ------------------------------------------- */
  const [enableNutrients, setEnableNutrients] = useState(
    widget.displayNutrientPreferences
  );
  const [enableCalories, setEnableCalories] = useState(
    widget.displayMacronutrients
  );

  /* ---------- build-your-own -------------------------------------- */
  const [enableBuildYourOwn, setEnableBuildYourOwn] = useState(
    widget.isByoEnabled
  );

  /* ---------- ordering -------------------------------------------- */
  const [enableOrdering, setEnableOrdering] = useState(
    widget.isOrderButtonEnabled
  );
  const [baseUrl, setBaseUrl] = useState(widget.orderUrl?.split('?')[0] ?? '');
  const [utmTags, setUtmTags] = useState(widget.orderUrl?.split('?')[1] ?? '');

  const fullUrl = useMemo(
    () => (enableOrdering && baseUrl ? `${baseUrl}${utmTags ? `?${utmTags}` : ''}` : ''),
    [enableOrdering, baseUrl, utmTags]
  );

  /* ------------------------------------------------------------------
   * Emit diff upward whenever any setting changes
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const diff: Record<string, unknown> = {};

    diff.supportedDietaryPreferences = enableDiets ? selectedDiets : [];
    diff.displayIngredients = enableIngredients;

    diff.supportedAllergens = enableAllergens ? selectedAllergens : [];

    diff.displayNutrientPreferences = enableNutrients;
    diff.displayMacronutrients = enableCalories;

    diff.isByoEnabled = enableBuildYourOwn;

    diff.isOrderButtonEnabled = enableOrdering;
    diff.orderUrl = fullUrl || null;

    onFieldChange(diff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enableDiets,
    selectedDiets,
    enableIngredients,
    enableAllergens,
    selectedAllergens,
    enableNutrients,
    enableCalories,
    enableBuildYourOwn,
    enableOrdering,
    baseUrl,
    utmTags,
    fullUrl,
  ]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <section className="space-y-6" data-testid="features-panel">
      {/* Dietary + Ingredients */}
      <DietarySection
        dietOptions={DIET_OPTIONS}
        enableDiets={enableDiets}
        onToggleDiets={setEnableDiets}
        selectedDiets={selectedDiets}
        onChangeSelectedDiets={setSelectedDiets}
        enableIngredients={enableIngredients}
        onToggleIngredients={setEnableIngredients}
        toggleArrayItem={toggleArrayItem}
      />

      {/* Allergens */}
      <AllergensSection
        allergenOptions={ALLERGEN_OPTIONS}
        enableAllergens={enableAllergens}
        onToggleAllergens={setEnableAllergens}
        selectedAllergens={selectedAllergens}
        onChangeSelectedAllergens={setSelectedAllergens}
        toggleArrayItem={toggleArrayItem}
      />

      {/* Nutrients */}
      <SettingToggle
        icon={<Activity className="h-4 w-4" />}
        title="Nutrients"
        description="Enable filtering by protein, fat & carb ranges"
        checked={enableNutrients}
        onChange={setEnableNutrients}
      />
      {enableNutrients && (
        <div className="pl-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={enableCalories}
              onChange={() => setEnableCalories(!enableCalories)}
            />
            Macro&nbsp;Nutrients
          </label>
        </div>
      )}

      {/* Build-Your-Own */}
      <SettingToggle
        icon={<Hammer className="h-4 w-4" />}
        title="Build-Your-Own"
        description="Enable BYO for all dishes by default"
        checked={enableBuildYourOwn}
        onChange={setEnableBuildYourOwn}
      />

      {/* Ordering */}
      <SettingToggle
        icon={<ShoppingCart className="h-4 w-4" />}
        title="Ordering"
        description="Configure the order-button link & UTM tags"
        checked={enableOrdering}
        onChange={setEnableOrdering}
      />
      {enableOrdering && (
        <div className="space-y-3 pl-6">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="base-url">
              Base&nbsp;URL
            </label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="utm-tags">
              UTM&nbsp;Tags
            </label>
            <Input
              id="utm-tags"
              value={utmTags}
              onChange={(e) => setUtmTags(e.target.value)}
              placeholder="utm_source=...&utm_medium=..."
            />
          </div>
          <p className="text-sm break-all bg-gray-50 border rounded px-2 py-1">
            {fullUrl || '—'}
          </p>
        </div>
      )}
    </section>
  );
}