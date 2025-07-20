import { gql } from "@apollo/client";
import {
  WIDGET_ANALYTICS_FIELDS,
  WIDGET_FIELDS,
} from "../../../smartMenus/graphql/fragments";

// Dashboard widgets query (from api.everybite.com/graphql)
export const API_GET_ALL_WIDGETS = gql /* GraphQL */ `
  query GetAllWidgets {
    widgets {
      id
      createdAt
      publishedAt
      numberOfLocations
    }
  }
`;

// Player analytics query (from api.everybite.com/graphql)
export const API_GET_ALL_WIDGETS_BASICS = gql`
  query GetAllWidgetsBasics {
    widgets {
      ...WidgetAnalyticsFields
    }
  }
  ${WIDGET_ANALYTICS_FIELDS}
`;

// Optimized SmartMenu settings query using main API
// This gets the core widget data that the main API can provide
export const SMARTMENU_SETTINGS_OPTIMIZED = gql`
  query GetSmartMenuSettingsOptimized {
    widgets {
      ...WidgetFields
    }
  }
  ${WIDGET_FIELDS}
`;

// Basic widget data for comparison with Lambda
export const SMARTMENU_SETTINGS_BASIC = gql`
  query GetSmartMenuSettingsBasic {
    widgets {
      id
      name
      slug
      createdAt
      updatedAt
      publishedAt
      numberOfLocations
      numberOfLocationsSource
      displayImages
      layout
      isOrderButtonEnabled
      isByoEnabled
      isActive
      isSyncEnabled
      lastSyncedAt
      primaryBrandColor
      highlightColor
      backgroundColor
      orderUrl
      supportedAllergens
      displaySoftSignUp
      displayNotifyMeBanner
      displayGiveFeedbackBanner
      displayFeedbackButton
      displayDishDetailsLink
    }
  }
`;
