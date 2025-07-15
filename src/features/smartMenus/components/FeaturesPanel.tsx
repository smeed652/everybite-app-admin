import { Hammer, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "../../../components/ui/Panel";
import { SettingToggle } from "../../../components/ui/SettingToggle";
import type { Widget } from "../../../generated/graphql";
import { AllergenType, DietType } from "../../../generated/graphql";

import AllergensSection from "./AllergensSection";
import DietarySection from "./DietarySection";
import NutrientsSection from "./NutrientsSection";
import OrderingSection from "./OrderingSection";

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
const DIET_OPTIONS: DietType[] = Object.values(DietType);
const ALLERGEN_OPTIONS: AllergenType[] = Object.values(AllergenType);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function FeaturesPanel({
  widget,
  onFieldChange,
}: FeaturesPanelProps) {
  /* ---------- diets / ingredients ---------------------------------- */
  const normalizeEnum = (v: string) => v as DietType;
  const [selectedDiets, setSelectedDiets] = useState<DietType[]>(
    widget.supportedDietaryPreferences &&
      widget.supportedDietaryPreferences.length > 0
      ? (widget.supportedDietaryPreferences.map(normalizeEnum) as DietType[])
      : []
  );
  const [enableDiets, setEnableDiets] = useState(selectedDiets.length > 0);

  const [enableIngredients, setEnableIngredients] = useState(
    widget.displayIngredients
  );

  /* ---------- allergens ------------------------------------------- */
  const normalizeAllergen = (v: string) => v as AllergenType;
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>(
    widget.supportedAllergens && widget.supportedAllergens.length > 0
      ? (widget.supportedAllergens.map(normalizeAllergen) as AllergenType[])
      : []
  );
  const [enableAllergens, setEnableAllergens] = useState(
    widget.supportedAllergens && widget.supportedAllergens.length > 0
  );

  /* ---------- nutrients ------------------------------------------- */
  const [enableNutrients, setEnableNutrients] = useState(
    widget.displayNutrientPreferences
  );
  const [enableCalories, setEnableCalories] = useState(
    widget.displayMacronutrients
  );

  /* ---------- feedback button ------------------------------------- */
  const [feedbackButton, setFeedbackButton] = useState(
    widget.displayFeedbackButton ?? false
  );

  /* ---------- build-your-own -------------------------------------- */
  const [enableBuildYourOwn, setEnableBuildYourOwn] = useState(
    widget.isByoEnabled
  );

  /* ---------- ordering -------------------------------------------- */
  const [enableOrdering, setEnableOrdering] = useState(
    widget.isOrderButtonEnabled
  );
  const [baseUrl, setBaseUrl] = useState(widget.orderUrl?.split("?")[0] ?? "");
  const [utmTags, setUtmTags] = useState(widget.orderUrl?.split("?")[1] ?? "");

  const fullUrl = useMemo(
    () =>
      enableOrdering && baseUrl
        ? `${baseUrl}${utmTags ? `?${utmTags}` : ""}`
        : "",
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
      const originalValue = widget[k];

      // Special handling for allergens and dietary preferences to account for normalization
      if (k === "supportedAllergens" || k === "supportedDietaryPreferences") {
        // No normalization needed since we're using the correct enum values
        if (JSON.stringify(v) !== JSON.stringify(originalValue)) {
          diff[k] = v;
        }
      } else {
        if (JSON.stringify(v) !== JSON.stringify(originalValue)) {
          diff[k] = v;
        }
      }
    });

    // Debug logging for timing issues
    if (Object.keys(diff).length > 0) {
      console.debug("[FeaturesPanel] emitting diff:", diff);
      console.debug(
        "[FeaturesPanel] widget allergens:",
        widget.supportedAllergens
      );
      console.debug("[FeaturesPanel] selected allergens:", selectedAllergens);
      console.debug("[FeaturesPanel] enable allergens:", enableAllergens);
    }

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
