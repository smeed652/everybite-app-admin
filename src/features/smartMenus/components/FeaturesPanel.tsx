import { Widget, DietType, AllergenType } from '../../../generated/graphql';
import { Card } from '../../../components/ui/Card';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Record<string, unknown>) => void;
}

import { useState, useEffect } from 'react';
import { Leaf, Utensils, AlertCircle, Activity, Hammer, ShoppingCart } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Toggle';

const dietOptions: DietType[] = [DietType.Vegetarian, DietType.Pescatarian, DietType.Vegan];
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


  
export default function FeaturesPanel({ widget, onFieldChange }: Props) {
  // Feature flags & selections derived from typed widget props
  const [selectedDiets, setSelectedDiets] = useState<DietType[]>(widget.supportedDietaryPreferences ?? []);
  const [enableDiets, _setEnableDiets] = useState<boolean>((widget.supportedDietaryPreferences ?? []).length > 0);
  const setEnableDiets = (v: boolean) => {
    _setEnableDiets(v);
    if (!v) {
      setSelectedDiets([]);
    } else if (v && selectedDiets.length === 0) {
      setSelectedDiets([dietOptions[0]]);
    }
  };

  const [enableIngredients, setEnableIngredients] = useState<boolean>(widget.displayIngredients);

  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>(widget.supportedAllergens ?? []);
  const [enableAllergens, _setEnableAllergens] = useState<boolean>((widget.supportedAllergens ?? []).length > 0);
  const setEnableAllergens = (v: boolean) => {
    _setEnableAllergens(v);
    if (!v) {
      setSelectedAllergens([]);
    } else if (v && selectedAllergens.length === 0) {
      setSelectedAllergens([allergenOptions[0]]);
    }
  };

  const [enableNutrients, _setEnableNutrients] = useState<boolean>(widget.displayNutrientPreferences);
  const setEnableNutrients = (v: boolean) => {
    _setEnableNutrients(v);
    if (!v) {
      setEnableCalories(false);
    }
  };
  const [enableCalories, _setEnableCalories] = useState<boolean>(widget.displayMacronutrients);
  const setEnableCalories = (v: boolean) => {
    if (!enableNutrients) return;
    _setEnableCalories(v);
  };

  const [enableBuildYourOwn, setEnableBuildYourOwn] = useState<boolean>(widget.isByoEnabled);
  const [enableOrdering, setEnableOrdering] = useState<boolean>(widget.isOrderButtonEnabled);
  // split initial orderUrl into base and UTM query string
  const initialBase = widget.orderUrl?.split('?')[0] ?? '';
  const initialUtm = widget.orderUrl?.split('?')[1] ?? '';
  const [baseUrl, setBaseUrl] = useState<string>(initialBase);
  const [utmTags, setUtmTags] = useState<string>(initialUtm);
  const fullUrl = `${baseUrl}${utmTags ? (baseUrl.includes('?') ? '&' : '?') + utmTags : ''}`;

  // propagate changes
  // Emit only the fields whose value differs from the original widget so Basics-style dirty detection works
  useEffect(() => {
    const diff: Record<string, unknown> = {};
    const dietsVal = enableDiets ? selectedDiets : [];
    if (JSON.stringify(dietsVal) !== JSON.stringify(widget.supportedDietaryPreferences ?? [])) {
      diff.supportedDietaryPreferences = dietsVal;
    }
    if (enableIngredients !== widget.displayIngredients) {
      diff.displayIngredients = enableIngredients;
    }
    const allergenVal = enableAllergens ? selectedAllergens : [];
    if (JSON.stringify(allergenVal) !== JSON.stringify(widget.supportedAllergens ?? [])) {
      diff.supportedAllergens = allergenVal;
    }
    if (enableNutrients !== widget.displayNutrientPreferences) {
      diff.displayNutrientPreferences = enableNutrients;
    }
    if (enableCalories !== widget.displayMacronutrients) {
      diff.displayMacronutrients = enableCalories;
    }
    if (enableBuildYourOwn !== widget.isByoEnabled) {
      diff.isByoEnabled = enableBuildYourOwn;
    }
    if (enableOrdering !== widget.isOrderButtonEnabled) {
      diff.isOrderButtonEnabled = enableOrdering;
    }
    if (fullUrl !== (widget.orderUrl ?? '')) {
      diff.orderUrl = fullUrl;
    }

    // Only emit when there is at least one changed key
    if (Object.keys(diff).length > 0) {
      onFieldChange(diff);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableDiets, selectedDiets, enableIngredients, enableAllergens, selectedAllergens, enableNutrients, enableCalories, enableBuildYourOwn, enableOrdering, baseUrl, utmTags]);

  const toggleArrayItem = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  return (
    <section className="space-y-6" data-testid="features-panel">
      {/* Diets */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4" />Diets
              {enableDiets && (
                <button
                  type="button"
                  onClick={() => setSelectedDiets(dietOptions)}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Select&nbsp;All
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Display diet filters in the preference bar (select at least one diet when enabled)</p>
          </div>
          <Toggle checked={enableDiets} onChange={setEnableDiets} />
        </div>
        {enableDiets && (
          <div className="pl-6 grid grid-cols-2 gap-2">
            {dietOptions.map((diet) => (
              <label key={diet} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedDiets.includes(diet)}
                  onChange={() => setSelectedDiets(toggleArrayItem(selectedDiets, diet))}
                  className="h-4 w-4"
                />
                {diet}
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Ingredients */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium"><Utensils className="h-4 w-4" />Ingredients</p>
          <p className="text-sm text-muted-foreground">Allow users to search by including/excluding certain ingredients</p>
        </div>
        <Toggle checked={enableIngredients} onChange={setEnableIngredients} />
      </Card>

      {/* Allergens */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />Allergens
              {enableAllergens && (
                <button
                  type="button"
                  onClick={() => setSelectedAllergens(allergenOptions)}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Select&nbsp;All
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Enable allergen filters (select at least one allergen when enabled)</p>
          </div>
          <Toggle checked={enableAllergens} onChange={setEnableAllergens} />
        </div>
        {enableAllergens && (
          <div className="pl-6 grid grid-cols-2 gap-2">
            {allergenOptions.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAllergens.includes(a)}
                  onChange={() => setSelectedAllergens(toggleArrayItem(selectedAllergens, a))}
                  className="h-4 w-4"
                />
                {a}
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Nutrients */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4" />Nutrients</p>
            <p className="text-sm text-muted-foreground">Enable filtering by protein, fat and carbohydrate ranges</p>
          </div>
          <Toggle checked={enableNutrients} onChange={setEnableNutrients} />
        </div>
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
      </Card>

      {/* Build-Your-Own */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium"><Hammer className="h-4 w-4" />Build-Your-Own</p>
          <p className="text-sm text-muted-foreground">Enable Build-Your-Own for all dishes on the menu by default.</p>
        </div>
        <Toggle checked={enableBuildYourOwn} onChange={setEnableBuildYourOwn} />
      </Card>

      {/* Ordering */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium"><ShoppingCart className="h-4 w-4" />Ordering</p>
            <p className="text-sm text-muted-foreground">Configure the order-button link and marketing tags</p>
          </div>
          <Toggle checked={enableOrdering} onChange={setEnableOrdering} />
        </div>
        {enableOrdering && (
          <div className="space-y-3 pl-6">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="base-url">Base&nbsp;URL</label>
              <Input id="base-url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="utm-tags">UTM&nbsp;Tags</label>
              <Input id="utm-tags" value={utmTags} onChange={(e) => setUtmTags(e.target.value)} placeholder="utm_source=...&utm_medium=..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Full&nbsp;URL</label>
              <p className="text-sm break-all bg-gray-50 border rounded px-2 py-1">{fullUrl || '—'}</p>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
