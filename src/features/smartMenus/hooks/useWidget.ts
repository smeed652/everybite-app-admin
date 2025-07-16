import { gql, useQuery } from "@apollo/client";
import type { Widget } from "../../../generated/graphql";

// Expanded fragment with more fields - testing in groups
const EXPANDED_WIDGET_FIELDS = gql`
  fragment ExpandedWidgetFields on Widget {
    # Core identification (working)
    id
    name
    slug

    # Layout and display (working)
    layout
    displayImages
    isActive
    isOrderButtonEnabled
    isByoEnabled

    # Colors and branding (working)
    primaryBrandColor
    highlightColor
    backgroundColor

    # URLs and links (working)
    orderUrl
    # logoUrl - known to cause errors
    logoWidth
    faviconUrl
    widgetLogoUrl
    widgetUrl

    # Dietary and allergen preferences (working)
    supportedDietaryPreferences
    supportedAllergens
    displayIngredients
    displayNutrientPreferences
    displayMacronutrients

    # CTA and feedback flags (working)
    displaySoftSignUp
    displayNotifyMeBanner
    displayGiveFeedbackBanner
    displayFeedbackButton
    displayDishDetailsLink

    # Navigation and pagination (testing this group)
    displayNavbar
    usePagination
    displayFooter
    footerText

    # Button styling (testing this group)
    buttonFont
    buttonBackgroundColor
    buttonTextColor
    buttonBorderRadius

    # Timestamps (working)
    createdAt
    updatedAt
    publishedAt

    # Required for Apollo Client
    __typename
  }
`;

export const GET_WIDGET = gql`
  query GetWidget($id: ID!) {
    widget(id: $id) {
      ...ExpandedWidgetFields
    }
  }
  ${EXPANDED_WIDGET_FIELDS}
`;

interface UseWidgetResult {
  loading: boolean;
  error?: Error;
  widget?: Widget;
}

export function useWidget(id: string): UseWidgetResult {
  console.log("[useWidget] Querying widget with ID:", id);

  const { data, loading, error } = useQuery(GET_WIDGET, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });

  // Debug logging
  if (error) {
    console.error("[useWidget] GraphQL Error:", error);
    console.error("[useWidget] Error message:", error.message);
    console.error("[useWidget] Error networkError:", error.networkError);
    console.error("[useWidget] Error graphQLErrors:", error.graphQLErrors);

    // Log detailed GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      error.graphQLErrors.forEach((graphQLError, index) => {
        console.error(`[useWidget] GraphQL Error ${index}:`, {
          message: graphQLError.message,
          path: graphQLError.path,
          extensions: graphQLError.extensions,
          locations: graphQLError.locations,
        });
      });
    }
  }

  if (data) {
    console.log("[useWidget] Received data:", data);
  }

  return {
    loading,
    error: error as Error | undefined,
    widget: data?.widget,
  };
}
