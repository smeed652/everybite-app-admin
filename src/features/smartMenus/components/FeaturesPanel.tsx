import { useState, useEffect } from 'react';
import {
  Widget,
  DietType,
  AllergenType,
} from '../../../generated/graphql';

import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Input } from '../../../components/ui/Input';

import {
  Leaf,
  Utensils,
  AlertCircle,
  Activity,
  Hammer,
  ShoppingCart,
} from 'lucide-react';

interface Props {
  widget: Widget;
  onFieldChange: (diff: Record<string, unknown>) => void;
}

/* ------------------------------------------------------------------ */

const dietOptions: DietType[] = [
  DietType.Vegetarian,
  DietType.Pescatarian,
  DietType.Vegan,
];

const allergenOptions: AllergenType[] = [
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

export default function FeaturesPanel({ widget, onFieldChange }: Props) {
  /* ---------- local state derived from widget --------------------- */
  const [selectedDiets, setSelectedDiets] = useState<DietType[]>(
    widget.supportedDietaryPreferences ?? []
  );
  const [enableDiets, setEnableDiets] = useState(
    (widget.supportedDietaryPreferences ?? []).length > 0
  );

  const [enableIngredients, setEnableIngredients] = useState(
    widget.displayIngredients
  );

  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>(
    widget.supportedAllergens ?? []
  );
  const [enableAllergens, setEnableAllergens] = useState(
    (widget.supportedAllergens ?? []).length > 0
  );

  const [enableNutrients, setEnableNutrients] = useState(
    widget.displayNutrientPreferences
  );
  const [enableCalories, setEnableCalories] = useState(
    widget.displayMacronutrients
  );

  const [enableBuildYourOwn, setEnableBuildYourOwn] = useState(
    widget.isByoEnabled
  );

  const [enableOrdering, setEnableOrdering] = useState(
    widget.isOrderButtonEnabled
  );
  const initialBase = widget.orderUrl?.split('?')[0] ?? '';
  const initialUtm = widget.orderUrl?.split('?')[1] ?? '';
  const [baseUrl, setBaseUrl] = useState(initialBase);
  const [utmTags, setUtmTags] = useState(initialUtm);

  const fullUrl =
    baseUrl + (utmTags ? (baseUrl.includes('?') ? '&' : '?') + utmTags : '');

  /* ---------- helpers -------------------------------------------- */
  const toggleArrayItem = <T,>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  /* ---------- propagate diff up ---------------------------------- */
  useEffect(() => {
    const diff: Record<string, unknown> = {};

    const dietsVal = enableDiets ? selectedDiets : [];
    if (
      JSON.stringify(dietsVal) !==
      JSON.stringify(widget.supportedDietaryPreferences ?? [])
    )
      diff.supportedDietaryPreferences = dietsVal;

    if (enableIngredients !== widget.displayIngredients)
      diff.displayIngredients = enableIngredients;

    const allergensVal = enableAllergens ? selectedAllergens : [];
    if (
      JSON.stringify(allergensVal) !==
      JSON.stringify(widget.supportedAllergens ?? [])
    )
      diff.supportedAllergens = allergensVal;

    if (enableNutrients !== widget.displayNutrientPreferences)
      diff.displayNutrientPreferences = enableNutrients;
    if (enableCalories !== widget.displayMacronutrients)
      diff.displayMacronutrients = enableCalories;

    if (enableBuildYourOwn !== widget.isByoEnabled)
      diff.isByoEnabled = enableBuildYourOwn;

    if (enableOrdering !== widget.isOrderButtonEnabled)
      diff.isOrderButtonEnabled = enableOrdering;
    if (fullUrl !== (widget.orderUrl ?? '')) diff.orderUrl = fullUrl;

    if (Object.keys(diff).length) onFieldChange(diff);
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
  ]);

  /* ---------- render --------------------------------------------- */
  return (
    <section className="space-y-6" data-testid="features-panel">
      {/* Diets ------------------------------------------------------ */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4" />
              Diets
              {enableDiets && (
                <button
                  type="button"
                  onClick={() => setSelectedDiets(dietOptions)}
                  className="text-xs underline text-blue-600 hover:text-blue-800"
                >
                  Select&nbsp;All
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Display diet filters (select at least one diet when enabled)
            </p>
          </div>
          <Toggle checked={enableDiets} onChange={setEnableDiets} />
        </div>

        {enableDiets && (
          <div className="pl-6 grid grid-cols-2 gap-2">
            {dietOptions.map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedDiets.includes(d)}
                  onChange={() => setSelectedDiets(toggleArrayItem(selectedDiets, d))}
                />
                {d}
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Ingredients ------------------------------------------------ */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Utensils className="h-4 w-4" /> Ingredients
          </p>
          <p className="text-sm text-muted-foreground">
            Allow users to search by including/excluding ingredients
          </p>
        </div>
        <Toggle checked={enableIngredients} onChange={setEnableIngredients} />
      </Card>

      {/* Allergens -------------------------------------------------- */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              Allergens
              {enableAllergens && (
                <button
                  type="button"
                  onClick={() => setSelectedAllergens(allergenOptions)}
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
          <Toggle checked={enableAllergens} onChange={setEnableAllergens} />
        </div>

        {enableAllergens && (
          <div className="pl-6 grid grid-cols-2 gap-2">
            {allergenOptions.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedAllergens.includes(a)}
                  onChange={() =>
                    setSelectedAllergens(toggleArrayItem(selectedAllergens, a))
                  }
                />
                {a}
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Nutrients -------------------------------------------------- */}
      <SettingToggle
        icon={<Activity className="h-4 w-4" />}
        title="Nutrients"
        description="Enable filtering by protein, fat and carbohydrate ranges"
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

      {/* Build-Your-Own ------------------------------------------- */}
      <SettingToggle
        icon={<Hammer className="h-4 w-4" />}
        title="Build-Your-Own"
        description="Enable Build-Your-Own for all dishes by default"
        checked={enableBuildYourOwn}
        onChange={setEnableBuildYourOwn}
      />

      {/* Ordering --------------------------------------------------- */}
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Full&nbsp;URL</label>
            <p className="text-sm break-all bg-gray-50 border rounded px-2 py-1">
              {fullUrl || '—'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}