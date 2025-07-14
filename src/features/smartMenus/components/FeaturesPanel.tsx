import { useEffect, useMemo, useState } from 'react';
import type { Widget, DietType, AllergenType } from '../../../generated/graphql';
import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Panel } from '../../../components/ui/Panel';
import { Hammer, ThumbsUp } from 'lucide-react';

import DietarySection from './DietarySection';
import AllergensSection from './AllergensSection';
import NutrientsSection from './NutrientsSection';
import OrderingSection from './OrderingSection';

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
  'VEGETARIAN' as DietType,
  'PESCATARIAN' as DietType,
  'VEGAN' as DietType,
];

const ALLERGEN_OPTIONS: AllergenType[] = [
  'WHEAT' as AllergenType,
  'DAIRY' as AllergenType,
  'EGG' as AllergenType,
  'FISH' as AllergenType,
  'SHELLFISH' as AllergenType,
  'TREE_NUT' as AllergenType,
  'PEANUT' as AllergenType,
  'SESAME' as AllergenType,
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function FeaturesPanel({
  widget,
  onFieldChange,
}: FeaturesPanelProps) {
  /* ---------- diets / ingredients ---------------------------------- */
  const toSnakeUpper = (v: string) =>
    v
      .replace(/([a-z])([A-Z])/g, '$1_$2') // insert underscore before capitals in CamelCase
      .replace(/\s+/g, '_')
      .toUpperCase();
  const normalizeEnum = (v: string) => toSnakeUpper(v) as unknown as DietType;
  const [selectedDiets, setSelectedDiets] = useState<DietType[]>(
    widget.supportedDietaryPreferences && widget.supportedDietaryPreferences.length > 0
      ? (widget.supportedDietaryPreferences.map(normalizeEnum) as DietType[])
      : []
  );
  const [enableDiets, setEnableDiets] = useState(selectedDiets.length > 0);

  const [enableIngredients, setEnableIngredients] = useState(
    widget.displayIngredients
  );

  /* ---------- allergens ------------------------------------------- */
  const normalizeAllergen = (v: string) => toSnakeUpper(v) as unknown as AllergenType;
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>(
    widget.supportedAllergens && widget.supportedAllergens.length > 0
      ? (widget.supportedAllergens.map(normalizeAllergen) as AllergenType[])
      : ALLERGEN_OPTIONS
  );
  const [enableAllergens, setEnableAllergens] = useState(true);

  /* ---------- nutrients ------------------------------------------- */
  const [enableNutrients, setEnableNutrients] = useState(
    widget.displayNutrientPreferences
  );
  const [enableCalories, setEnableCalories] = useState(
    widget.displayMacronutrients
  );

  /* ---------- feedback button ------------------------------------- */
  const [feedbackButton, setFeedbackButton] = useState(widget.displayFeedbackButton ?? false);

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
    () =>
      enableOrdering && baseUrl
        ? `${baseUrl}${utmTags ? `?${utmTags}` : ''}`
        : '',
    [enableOrdering, baseUrl, utmTags]
  );

  /* ------------------------------------------------------------------
   * Emit diff upward whenever any setting changes
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const raw: Record<string, unknown> = {
      supportedDietaryPreferences: enableDiets ? selectedDiets : [],
      displayIngredients: enableIngredients,
      supportedAllergens: enableAllergens ? selectedAllergens : [],
      displayNutrientPreferences: enableNutrients,
      displayMacronutrients: enableCalories,
      displayFeedbackButton: feedbackButton,
      isByoEnabled: enableBuildYourOwn,
      isOrderButtonEnabled: enableOrdering,
      orderUrl: fullUrl || null,
    };

    // send only the keys that differ from the original widget to avoid
    // false-positive dirty states
    const diff: Record<string, unknown> = {};
    Object.entries(raw).forEach(([k, v]) => {
      // @ts-expect-error – dynamic widget field access
      if (JSON.stringify(v) !== JSON.stringify(widget[k])) {
        diff[k] = v;
      }
    });
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
    feedbackButton,
    enableBuildYourOwn,
    enableOrdering,
    baseUrl,
    utmTags,
  ]);

  /* ---------- JSX -------------------------------------------------- */
  return (
    <Panel title="Features" data-testid="features-panel">
      {/* Diets & Ingredients */}
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
      <NutrientsSection
        enableNutrients={enableNutrients}
        onToggleNutrients={setEnableNutrients}
        enableCalories={enableCalories}
        onToggleCalories={setEnableCalories}
      />

      {/* Build-Your-Own */}
      <SettingToggle
        icon={<Hammer aria-hidden="true" className="h-4 w-4" />}
        title="Build-Your-Own"
        description="Enable BYO for all dishes by default"
        checked={enableBuildYourOwn}
        onChange={setEnableBuildYourOwn}
      />

      {/* Ordering */}
      <OrderingSection
        enableOrdering={enableOrdering}
        onToggleOrdering={setEnableOrdering}
        baseUrl={baseUrl}
        onBaseUrlChange={setBaseUrl}
        utmTags={utmTags}
        onUtmTagsChange={setUtmTags}
      />

      {/* Floating Feedback button */}
      <SettingToggle
        icon={<ThumbsUp aria-hidden="true" className="h-4 w-4" />}
        title="Floating Feedback Button"
        description="Persistent button that opens feedback modal. Captures feedback and email."
        checked={feedbackButton}
        onChange={setFeedbackButton}
      />
    </Panel>
  );
}

export { FeaturesPanel };
