import { ThumbsUp } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { Panel } from "../../../components/ui/Panel";
import { SettingToggle } from "../../../components/ui/SettingToggle";
import type { Widget } from "../../../generated/graphql";
import { AllergenType, DietType } from "../../../generated/graphql";
import { logger } from "../../../lib/logger";
import AllergensSection from "./AllergensSection";
import DietarySection from "./DietarySection";
import NutrientsSection from "./NutrientsSection";
import OrderingSection from "./OrderingSection";

interface FeaturesPanelProps {
  widget: Widget;
  onFieldChange: (changes: Record<string, unknown>) => void;
}

const FeaturesPanel = memo(function FeaturesPanel({
  widget,
  onFieldChange,
}: FeaturesPanelProps) {
  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const [enableDiets, setEnableDiets] = useState(
    (widget.supportedDietaryPreferences?.length ?? 0) > 0
  );
  const [selectedDiets, setSelectedDiets] = useState<DietType[]>(
    widget.supportedDietaryPreferences ?? []
  );

  const [enableIngredients, setEnableIngredients] = useState(
    widget.displayIngredients
  );

  const [enableAllergens, setEnableAllergens] = useState(
    (widget.supportedAllergens?.length ?? 0) > 0
  );
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>(
    widget.supportedAllergens ?? []
  );

  const [enableNutrients, setEnableNutrients] = useState(
    widget.displayNutrientPreferences
  );
  const [enableCalories, setEnableCalories] = useState(
    widget.displayMacronutrients
  );

  const [feedbackButton, setFeedbackButton] = useState(
    widget.displayFeedbackButton
  );

  const [enableBuildYourOwn, setEnableBuildYourOwn] = useState(
    widget.isByoEnabled
  );

  const [enableOrdering, setEnableOrdering] = useState(
    widget.isOrderButtonEnabled
  );
  const [baseUrl, setBaseUrl] = useState(widget.orderUrl?.split("?")[0] ?? "");
  const [utmTags, setUtmTags] = useState(widget.orderUrl?.split("?")[1] ?? "");

  /* ------------------------------------------------------------------
   * Memoized values
   * ------------------------------------------------------------------ */
  const fullUrl = useMemo(() => {
    if (!enableOrdering || !baseUrl) return null;
    return `${baseUrl}${utmTags ? `?${utmTags}` : ""}`;
  }, [enableOrdering, baseUrl, utmTags]);

  const allergenOptions = useMemo(() => Object.values(AllergenType), []);
  const dietOptions = useMemo(() => Object.values(DietType), []);

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
      logger.debug("[FeaturesPanel] emitting diff:", diff);
      logger.debug(
        "[FeaturesPanel] widget allergens:",
        widget.supportedAllergens
      );
      logger.debug("[FeaturesPanel] selected allergens:", selectedAllergens);
      logger.debug("[FeaturesPanel] enable allergens:", enableAllergens);
    }

    if (Object.keys(diff).length) onFieldChange(diff);
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
    fullUrl,
    widget,
    onFieldChange,
  ]);

  return (
    <Panel
      title="Features"
      description="Configure which features are enabled for your SmartMenu"
    >
      <div className="space-y-6">
        {/* Dietary Preferences & Ingredients */}
        <DietarySection
          dietOptions={dietOptions}
          enableDiets={enableDiets}
          onToggleDiets={setEnableDiets}
          selectedDiets={selectedDiets}
          onChangeSelectedDiets={setSelectedDiets}
          enableIngredients={enableIngredients}
          onToggleIngredients={setEnableIngredients}
        />

        {/* Allergens */}
        <AllergensSection
          allergenOptions={allergenOptions}
          enableAllergens={enableAllergens}
          onToggleAllergens={setEnableAllergens}
          selectedAllergens={selectedAllergens}
          onChangeSelectedAllergens={setSelectedAllergens}
        />

        {/* Nutrients */}
        <NutrientsSection
          enableNutrients={enableNutrients}
          onToggleNutrients={setEnableNutrients}
          enableCalories={enableCalories}
          onToggleCalories={setEnableCalories}
        />

        {/* Feedback Button */}
        <SettingToggle
          icon={<ThumbsUp className="h-4 w-4" />}
          title="Feedback Button"
          description="Show a feedback button for users to rate dishes"
          checked={feedbackButton}
          onChange={setFeedbackButton}
        />

        {/* Build Your Own */}
        <SettingToggle
          title="Build Your Own"
          description="Allow users to customize their orders"
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
      </div>
    </Panel>
  );
});

export default FeaturesPanel;
