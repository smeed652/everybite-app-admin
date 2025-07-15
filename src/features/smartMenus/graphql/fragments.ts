import { gql } from "@apollo/client";

/**
 * Comprehensive widget fields fragment
 * Single source of truth for all widget fields across queries and mutations
 */
export const WIDGET_FIELDS = gql`
  fragment WidgetFields on Widget {
    # Core identification
    id
    name
    slug

    # Layout and display
    layout
    displayImages
    isActive
    isOrderButtonEnabled
    isByoEnabled

    # Colors and branding
    primaryBrandColor
    highlightColor
    backgroundColor

    # URLs and links
    orderUrl
    logoUrl
    logoWidth
    faviconUrl
    widgetLogoUrl
    widgetUrl

    # Dietary and allergen preferences
    supportedDietaryPreferences
    supportedAllergens
    displayIngredients
    displayNutrientPreferences
    displayMacronutrients

    # CTA and feedback flags
    displaySoftSignUp
    displayNotifyMeBanner
    displayGiveFeedbackBanner
    displayFeedbackButton
    displayDishDetailsLink

    # Navigation and pagination
    displayNavbar
    usePagination
    displayFooter
    footerText

    # Button styling
    buttonFont
    buttonBackgroundColor
    buttonTextColor
    buttonBorderRadius

    # Typography and text colors
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

    # Page content
    htmlTitleText
    pageTitleText
    pageTitleTextColor

    # Location and metadata
    numberOfLocations
    numberOfLocationsSource

    # Timestamps
    createdAt
    updatedAt
    publishedAt

    # Required for Apollo Client
    __typename
  }
`;

/**
 * Basic widget fields for list views
 * Lightweight fragment for when we don't need all fields
 */
export const WIDGET_BASIC_FIELDS = gql`
  fragment WidgetBasicFields on Widget {
    id
    name
    slug
    layout
    displayImages
    isOrderButtonEnabled
    isByoEnabled
    primaryBrandColor
    highlightColor
    backgroundColor
    orderUrl
    updatedAt
    publishedAt
    isSyncEnabled
    __typename
  }
`;

/**
 * Widget fields for dashboard/analytics
 * Focused on fields needed for metrics and overview
 */
export const WIDGET_DASHBOARD_FIELDS = gql`
  fragment WidgetDashboardFields on Widget {
    id
    name
    isActive
    isSyncEnabled
    lastSyncedAt
    publishedAt
    updatedAt
    __typename
  }
`;

/**
 * Widget fields for player analytics
 * Minimal fields needed for dashboard metrics
 */
export const WIDGET_ANALYTICS_FIELDS = gql`
  fragment WidgetAnalyticsFields on Widget {
    id
    publishedAt
    displayImages
    layout
    isOrderButtonEnabled
    isByoEnabled
    __typename
  }
`;
