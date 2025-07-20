import { ThumbsUp } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "../../../components/ui/Panel";
import { SettingToggle } from "../../../components/ui/SettingToggle";
import {
  AllergenType,
  DietType,
  type Widget,
} from "../../../generated/graphql";
import { logger } from "../../../lib/logger";
import { AllergensSection } from "./AllergensSection";
import { DietarySection } from "./DietarySection";
import { NutrientsSection } from "./NutrientsSection";
import { OrderingSection } from "./OrderingSection";

interface FeaturesPanelProps {
  widget: Widget;
  onFieldChange: (changes: Record<string, unknown>) => void;
}

const FeaturesPanel = memo(function FeaturesPanel({
  widget,
  onFieldChange,
}: FeaturesPanelProps) {
  // Track if we've mounted to avoid emitting on initial render
  const mountedRef = useRef(false);

  /* ------------------------------------------------------------------
   * Local state for all feature settings
   * ------------------------------------------------------------------ */
  const [enableDiets, setEnableDiets] = useState(
    (widget.supportedDietaryPreferences?.length ?? 0) > 0
  );
  const [selectedDiets, setSelectedDiets] = useState(
    widget.supportedDietaryPreferences ?? []
  );
  const [enableIngredients, setEnableIngredients] = useState(
    widget.displayIngredients ?? false
  );
  const [enableAllergens, setEnableAllergens] = useState(
    (widget.supportedAllergens?.length ?? 0) > 0
  );
  const [selectedAllergens, setSelectedAllergens] = useState(
    widget.supportedAllergens ?? []
  );
  const [enableNutrients, setEnableNutrients] = useState(
    widget.displayNutrientPreferences ?? false
  );
  const [enableCalories, setEnableCalories] = useState(
    widget.displayMacronutrients ?? false
  );
  const [feedbackButton, setFeedbackButton] = useState(
    widget.displayFeedbackButton ?? false
  );
  const [enableBuildYourOwn, setEnableBuildYourOwn] = useState(
    widget.isByoEnabled ?? false
  );
  const [enableOrdering, setEnableOrdering] = useState(
    widget.isOrderButtonEnabled ?? false
  );

  // Parse the URL properly to handle multiple query parameters and fragments
  const parseOrderUrl = (url: string | null | undefined) => {
    if (!url) return { baseUrl: "", utmTags: "" };

    try {
      // Handle URLs with fragments like '#!/' by temporarily replacing them
      const tempUrl = url.replace("#", "___FRAGMENT___");
      const urlObj = new URL(tempUrl);

      // Extract the base URL (protocol + host + pathname)
      const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

      // Extract the full query string and restore fragments
      let utmTags = urlObj.search.slice(1); // Remove the leading '?'
      utmTags = utmTags.replace("___FRAGMENT___", "#");

      return { baseUrl, utmTags };
    } catch {
      // Fallback to simple split if URL parsing fails
      const parts = url.split("?");
      return {
        baseUrl: parts[0] || "",
        utmTags: parts.slice(1).join("?") || "",
      };
    }
  };

  const { baseUrl: initialBaseUrl, utmTags: initialUtmTags } = parseOrderUrl(
    widget.orderUrl
  );
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [utmTags, setUtmTags] = useState(initialUtmTags);

  const allergenOptions = useMemo(() => Object.values(AllergenType), []);
  const dietOptions = useMemo(() => Object.values(DietType), []);

  // Compute the full URL for display
  const fullUrl = useMemo(() => {
    if (!enableOrdering || !baseUrl) return null;
    return `${baseUrl}${utmTags ? `?${utmTags}` : ""}`;
  }, [enableOrdering, baseUrl, utmTags]);

  /* ------------------------------------------------------------------
   * Emit diff upward whenever any setting changes
   * ------------------------------------------------------------------ */
  useEffect(() => {
    // Skip first run on mount to avoid emitting default-diff noise
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const diff: Record<string, unknown> = {
      supportedDietaryPreferences: enableDiets ? selectedDiets : [],
      displayIngredients: enableIngredients,
      supportedAllergens: enableAllergens ? selectedAllergens : [],
      displayNutrientPreferences: enableNutrients,
      displayMacronutrients: enableCalories,
      displayFeedbackButton: feedbackButton,
      isByoEnabled: enableBuildYourOwn,
      isOrderButtonEnabled: enableOrdering,
    };

    // Only include orderUrl if it's different from the original
    const reconstructedUrl = fullUrl || null;
    if (reconstructedUrl !== widget.orderUrl) {
      diff.orderUrl = reconstructedUrl;
    }

    // Debug logging for timing issues
    if (Object.keys(diff).length > 0) {
      logger.debug("[FeaturesPanel] emitting diff:", diff);
    }

    onFieldChange(diff);
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

        {/* Build Your Own */}
        <SettingToggle
          icon={<ThumbsUp aria-hidden="true" className="h-4 w-4" />}
          title="Build Your Own"
          description="Allow users to customize their orders."
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

        {/* Feedback Button */}
        <SettingToggle
          icon={<ThumbsUp aria-hidden="true" className="h-4 w-4" />}
          title="Feedback Button"
          description="Show a feedback button for users to rate dishes."
          checked={feedbackButton}
          onChange={setFeedbackButton}
        />
      </div>
    </Panel>
  );
});

export default FeaturesPanel;
