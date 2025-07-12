import { gql, useQuery } from '@apollo/client';
import type { Widget } from '../../../generated/graphql';

export const GET_WIDGET = gql`
  query GetWidget($id: ID!) {
    widget(id: $id) {
      id
      name
      slug
      layout
      displayImages
      isActive
      isSyncEnabled
      isOrderButtonEnabled
      primaryBrandColor
      highlightColor
      backgroundColor
      orderUrl
      supportedDietaryPreferences
      displayIngredients
      supportedAllergens
      displayNutrientPreferences
      displayMacronutrients
      isByoEnabled
      # CTA flags
      displaySoftSignUp
      displayNotifyMeBanner
      displayGiveFeedbackBanner
      displayFooter
      footerText
      displayFeedbackButton
      displayDishDetailsLink
      # Additional flags & appearance
      displayNavbar
      usePagination
      displayFooter
      footerText
      buttonFont
      buttonBackgroundColor
      buttonTextColor
      buttonBorderRadius
      categoryTitleFont
      categoryTitleTextColor
      contentAreaGlobalColor
      contentAreaColumnHeaderColor
      subheaderFont
      subheaderLocationTextColor
      subheaderAdditionalTextColor
      navbarFont
      navbarFontSize
      navbarBackgroundColor
      logoUrl
      logoWidth
      faviconUrl
      htmlTitleText
      pageTitleText
      pageTitleTextColor
      numberOfLocations
      numberOfLocationsSource
      widgetLogoUrl
      widgetUrl
      isSyncEnabled
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

interface UseWidgetResult {
  loading: boolean;
  error?: Error;
  widget?: Widget;
}

export function useWidget(id: string): UseWidgetResult {
  const { data, loading, error } = useQuery(GET_WIDGET, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });
  return {
    loading,
    error: error as Error | undefined,
    widget: data?.widget,
  };
}
