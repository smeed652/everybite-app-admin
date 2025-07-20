import { gql } from "@apollo/client";

/**
 * Comprehensive SmartMenu settings query
 * Combines dashboard metrics and analytics data in a single query
 * Domain: WIDGETS, MetricType: COMPREHENSIVE, Granularity: DETAILED
 */
export const SMARTMENU_SETTINGS = gql`
  query GetSmartMenuSettings {
    db_widgetsList {
      items {
        # Core identification
        id
        name
        # slug - removed as not available in datawarehouse schema

        # Timestamps
        createdAt
        updatedAt
        publishedAt

        # Dashboard metrics
        numberOfLocations
        numberOfLocationsSource

        # Analytics - Feature adoption
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled

        # Chain classifications - temporarily disabled for performance
        # chain_nra_classifications {
        #   nra_classification
        # }
        # chain_menu_classifications {
        #   menu_type
        # }
        # chain_cuisine_classifications {
        #   cuisine_type
        # }

        # Analytics - Performance - will be added in future
        # isActive
        # isSyncEnabled
        # lastSyncedAt

        # Settings - Colors and branding
        primaryBrandColor
        highlightColor
        backgroundColor

        # Settings - URLs and links
        orderUrl
        # logoWidth - will be added in future
        # faviconUrl - will be added in future
        # widgetLogoUrl - will be added in future
        # widgetUrl - will be added in future

        # Settings - Dietary and allergen preferences
        # supportedDietaryPreferences - will be added in future
        supportedAllergens
        # displayIngredients - will be added in future
        # displayNutrientPreferences - will be added in future
        # displayMacronutrients - will be added in future

        # Settings - CTA and feedback flags
        displaySoftSignUp
        displayNotifyMeBanner
        displayGiveFeedbackBanner
        displayFeedbackButton
        displayDishDetailsLink

        # Settings - Navigation and pagination - will be added in future
        # displayNavbar
        # usePagination
        # displayFooter
        # footerText

        # Settings - Button styling (not currently in use)
        # buttonFont
        # buttonBackgroundColor
        # buttonTextColor
        # buttonBorderRadius

        # Settings - Typography and text colors (not currently in use)
        # categoryTitleFont
        # categoryTitleTextColor
        # contentAreaGlobalColor
        # contentAreaColumnHeaderColor
        # subheaderFont
        # subheaderLocationTextColor
        # subheaderAdditionalTextColor
        # navbarFont
        # navbarFontSize
        # navbarBackgroundColor

        # Settings - Page content (not currently in use)
        # htmlTitleText
        # pageTitleText
        # pageTitleTextColor
      }
      pagination {
        total
      }
    }

    # Quarterly metrics for orders
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      locations {
        count
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;

/**
 * Optimized SmartMenu settings query for cache refresh operations
 * Only includes essential fields needed for cache management
 * Domain: WIDGETS, MetricType: ESSENTIAL, Granularity: MINIMAL
 */
export const SMARTMENU_SETTINGS_ESSENTIAL = gql`
  query GetSmartMenuSettingsEssential {
    db_widgetsList {
      items {
        # Core identification only
        id
        name

        # Essential timestamps for cache invalidation
        updatedAt
        publishedAt

        # Essential metrics
        numberOfLocations
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled

        # Chain classifications - temporarily disabled for performance
        # chain_nra_classifications {
        #   nra_classification
        # }
        # chain_menu_classifications {
        #   menu_type
        # }
        # chain_cuisine_classifications {
        #   cuisine_type
        # }

        # Essential settings
        primaryBrandColor
        highlightColor
        backgroundColor
        orderUrl
        supportedAllergens

        # Essential CTA flags
        displaySoftSignUp
        displayNotifyMeBanner
        displayGiveFeedbackBanner
        displayFeedbackButton
        displayDishDetailsLink
      }
      pagination {
        total
      }
    }
  }
`;

/**
 * SmartMenu list query for dashboard overview
 * Minimal fields for list display and basic metrics
 * Domain: WIDGETS, MetricType: LIST, Granularity: BASIC
 */
export const SMARTMENU_LIST = gql`
  query GetSmartMenuList {
    db_widgetsList {
      items {
        id
        name
        updatedAt
        publishedAt
        numberOfLocations
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled
        primaryBrandColor
        orderUrl
      }
      pagination {
        total
      }
    }
  }
`;

/**
 * Quarterly metrics only query
 * Separate query for metrics to enable independent caching
 * Domain: METRICS, MetricType: QUARTERLY, Granularity: AGGREGATE
 */
export const QUARTERLY_METRICS_ONLY = gql`
  query GetQuarterlyMetrics {
    quarterlyMetrics {
      quarter
      year
      quarterLabel
      orders {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      activeSmartMenus {
        count
        qoqGrowth
        qoqGrowthPercent
      }
      locations {
        count
        qoqGrowth
        qoqGrowthPercent
      }
    }
  }
`;

/**
 * SmartMenu settings by ID query
 * Optimized for single widget detail views
 * Domain: WIDGETS, MetricType: DETAIL, Granularity: SINGLE
 */
export const SMARTMENU_BY_ID = gql`
  query GetSmartMenuById($id: ID!) {
    db_widgetsList {
      items {
        # Core identification
        id
        name

        # Timestamps
        createdAt
        updatedAt
        publishedAt

        # Dashboard metrics
        numberOfLocations
        numberOfLocationsSource

        # Analytics - Feature adoption
        displayImages
        layout
        isOrderButtonEnabled
        isByoEnabled

        # Settings - Colors and branding
        primaryBrandColor
        highlightColor
        backgroundColor

        # Settings - URLs and links
        orderUrl

        # Settings - Dietary and allergen preferences
        supportedAllergens

        # Settings - CTA and feedback flags
        displaySoftSignUp
        displayNotifyMeBanner
        displayGiveFeedbackBanner
        displayFeedbackButton
        displayDishDetailsLink
      }
      pagination {
        total
      }
    }
  }
`;
