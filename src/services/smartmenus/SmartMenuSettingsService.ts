import { DocumentNode, gql } from "@apollo/client";
import { SMARTMENU_SETTINGS } from "../../features/dashboard/graphql/lambda/queries/smartmenu-settings";
import {
  BusinessLogicResult,
  DataService,
  DataServiceConfig,
  MetricsData,
  ValidationResult,
} from "../base/DataService";

export interface SmartMenuSettings {
  // Core identification
  id: string;
  name: string;
  slug: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;

  // Dashboard metrics
  numberOfLocations?: number;
  numberOfLocationsSource?: string;

  // Analytics - Feature adoption
  displayImages: boolean;
  layout: string;
  isOrderButtonEnabled: boolean;
  isByoEnabled: boolean;

  // Chain classifications
  chain_nra_classifications?: {
    nra_classification: string;
  }[];
  chain_menu_classifications?: {
    menu_type: string;
  }[];
  chain_cuisine_classifications?: {
    cuisine_type: string;
  }[];

  // Analytics - Performance
  isActive: boolean;
  isSyncEnabled?: boolean;
  lastSyncedAt?: string;

  // Settings - Colors and branding
  primaryBrandColor?: string;
  highlightColor?: string;
  backgroundColor?: string;

  // Settings - URLs and links
  orderUrl?: string;
  logoWidth?: number;
  faviconUrl?: string;
  widgetLogoUrl?: string;
  widgetUrl?: string;

  // Settings - Dietary and allergen preferences
  supportedDietaryPreferences?: string[];
  supportedAllergens?: string[];
  displayIngredients?: boolean;
  displayNutrientPreferences?: boolean;
  displayMacronutrients?: boolean;

  // Settings - CTA and feedback flags
  displaySoftSignUp?: boolean;
  displayNotifyMeBanner?: boolean;
  displayGiveFeedbackBanner?: boolean;
  displayFeedbackButton?: boolean;
  displayDishDetailsLink?: boolean;

  // Settings - Navigation and pagination
  displayNavbar?: boolean;
  usePagination?: boolean;
  displayFooter?: boolean;
  footerText?: string;

  // Settings - Button styling
  buttonFont?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: number;

  // Settings - Typography and text colors
  categoryTitleFont?: string;
  categoryTitleTextColor?: string;
  contentAreaGlobalColor?: string;
  contentAreaColumnHeaderColor?: string;
  subheaderFont?: string;
  subheaderLocationTextColor?: string;
  subheaderAdditionalTextColor?: string;
  navbarFont?: string;
  navbarFontSize?: number;
  navbarBackgroundColor?: string;

  // Settings - Page content
  htmlTitleText?: string;
  pageTitleText?: string;
  pageTitleTextColor?: string;
}

export interface QuarterlyMetrics {
  quarter: number;
  year: number;
  quarterLabel: string;
  orders: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  activeSmartMenus: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
  locations: {
    count: number;
    qoqGrowth: number;
    qoqGrowthPercent: number;
  };
}

export interface SmartMenuSettingsFilters {
  isActive?: boolean;
  isPublished?: boolean;
  layout?: string;
  hasImages?: boolean;
  hasOrderButton?: boolean;
  hasByo?: boolean;
  hasLocations?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface SmartMenuSettingsMetrics {
  totalSmartMenus: number;
  activeSmartMenus: number;
  totalLocations: number;
  featureAdoption: {
    withImages: number;
    withOrderButton: number;
    withByo: number;
    byLayout: Record<string, number>;
  };
  quarterlyData: QuarterlyMetrics[];
  settings: {
    withCustomColors: number;
    withCustomFonts: number;
    withDietaryPreferences: number;
    withAllergens: number;
  };
}

/**
 * SmartMenu Settings Service - Comprehensive service for all SmartMenu data
 *
 * This service provides methods for:
 * - Complete SmartMenu settings and configuration
 * - Dashboard metrics and analytics
 * - Feature adoption analysis
 * - Settings usage statistics
 * - Quarterly metrics and trends
 */
export class SmartMenuSettingsService extends DataService<
  SmartMenuSettings,
  SmartMenuSettingsFilters
> {
  constructor(config?: DataServiceConfig) {
    super("SmartMenuSettingsService", config);
  }

  /**
   * Get comprehensive SmartMenu settings with all data
   */
  async getSmartMenuSettings(): Promise<
    BusinessLogicResult<{
      smartMenus: SmartMenuSettings[];
      quarterlyMetrics: QuarterlyMetrics[];
    }>
  > {
    const startTime = Date.now();

    try {
      const document = this.getSmartMenuSettingsQuery();

      const result = await this.executeQuery<{
        db_widgetsList: {
          items: SmartMenuSettings[];
          pagination: { total: number };
        };
        quarterlyMetrics: QuarterlyMetrics[];
      }>(document, undefined, {
        processResult: (data) => this.processSmartMenuSettingsResult(data),
        calculateMetrics: (data, processingTime) =>
          this.calculateSmartMenuSettingsMetrics(data, processingTime),
      });

      const processingTime = Date.now() - startTime;

      return {
        data: {
          smartMenus: result.data.db_widgetsList.items,
          quarterlyMetrics: result.data.quarterlyMetrics,
        },
        metrics: {
          totalCount: result.data.db_widgetsList.items.length,
          filteredCount: result.data.db_widgetsList.items.length,
          processingTime,
          cacheHit: false,
        },
      };
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get comprehensive metrics for SmartMenu settings
   */
  async getSmartMenuMetrics(): Promise<
    BusinessLogicResult<SmartMenuSettingsMetrics>
  > {
    const startTime = Date.now();

    try {
      const result = await this.getSmartMenuSettings();
      const smartMenus = result.data.smartMenus;
      const quarterlyData = result.data.quarterlyMetrics;

      const metrics = this.calculateSmartMenuMetrics(smartMenus, quarterlyData);
      const processingTime = Date.now() - startTime;

      return {
        data: metrics,
        metrics: {
          totalCount: smartMenus.length,
          filteredCount: smartMenus.length,
          processingTime,
          cacheHit: false,
        },
      };
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get SmartMenus by layout type
   */
  async getByLayout(
    layout: string
  ): Promise<BusinessLogicResult<SmartMenuSettings[]>> {
    const filters: SmartMenuSettingsFilters = { layout };
    return this.getFiltered(filters);
  }

  /**
   * Get active SmartMenus only
   */
  async getActiveSmartMenus(): Promise<
    BusinessLogicResult<SmartMenuSettings[]>
  > {
    const filters: SmartMenuSettingsFilters = { isPublished: true };
    return this.getFiltered(filters);
  }

  /**
   * Get SmartMenus with specific features
   */
  async getSmartMenusWithFeature(
    feature: "images" | "orderButton" | "byo" | "locations"
  ): Promise<BusinessLogicResult<SmartMenuSettings[]>> {
    const filters: SmartMenuSettingsFilters = {
      hasImages: feature === "images",
      hasOrderButton: feature === "orderButton",
      hasByo: feature === "byo",
      hasLocations: feature === "locations",
    };
    return this.getFiltered(filters);
  }

  /**
   * Get SmartMenus with custom settings
   */
  async getSmartMenusWithCustomSettings(
    setting: "colors" | "fonts" | "dietary" | "allergens"
  ): Promise<BusinessLogicResult<SmartMenuSettings[]>> {
    const result = await this.getAll();
    const smartMenus = result.data;

    let filtered: SmartMenuSettings[];

    switch (setting) {
      case "colors":
        filtered = smartMenus.filter(
          (sm) =>
            sm.primaryBrandColor || sm.highlightColor || sm.backgroundColor
        );
        break;
      case "fonts":
        filtered = smartMenus.filter(
          (sm) =>
            sm.buttonFont ||
            sm.categoryTitleFont ||
            sm.subheaderFont ||
            sm.navbarFont
        );
        break;
      case "dietary":
        filtered = smartMenus.filter(
          (sm) =>
            sm.supportedDietaryPreferences &&
            sm.supportedDietaryPreferences.length > 0
        );
        break;
      case "allergens":
        filtered = smartMenus.filter(
          (sm) => sm.supportedAllergens && sm.supportedAllergens.length > 0
        );
        break;
      default:
        filtered = smartMenus;
    }

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get SmartMenus by NRA classification
   */
  async getByNRAClassification(
    nraClass: string
  ): Promise<BusinessLogicResult<SmartMenuSettings[]>> {
    const result = await this.getAll();
    const smartMenus = result.data;

    const filtered = smartMenus.filter((sm) =>
      sm.chain_nra_classifications?.some(
        (nra) => nra.nra_classification === nraClass
      )
    );

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get SmartMenus by menu type
   */
  async getByMenuType(
    menuType: string
  ): Promise<BusinessLogicResult<SmartMenuSettings[]>> {
    const result = await this.getAll();
    const smartMenus = result.data;

    const filtered = smartMenus.filter((sm) =>
      sm.chain_menu_classifications?.some((menu) => menu.menu_type === menuType)
    );

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get SmartMenus by cuisine type
   */
  async getByCuisineType(
    cuisineType: string
  ): Promise<BusinessLogicResult<SmartMenuSettings[]>> {
    const result = await this.getAll();
    const smartMenus = result.data;

    const filtered = smartMenus.filter((sm) =>
      sm.chain_cuisine_classifications?.some(
        (cuisine) => cuisine.cuisine_type === cuisineType
      )
    );

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get SmartMenus with ordering enabled
   */
  async getSmartMenusWithOrdering(): Promise<
    BusinessLogicResult<SmartMenuSettings[]>
  > {
    const result = await this.getAll();
    const smartMenus = result.data;

    const filtered = smartMenus.filter((sm) => sm.isOrderButtonEnabled);

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get SmartMenus with footer enabled
   */
  async getSmartMenusWithFooter(): Promise<
    BusinessLogicResult<SmartMenuSettings[]>
  > {
    const result = await this.getAll();
    const smartMenus = result.data;

    const filtered = smartMenus.filter((sm) => sm.displayFooter);

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get SmartMenus with custom footer text
   */
  async getSmartMenusWithCustomFooterText(): Promise<
    BusinessLogicResult<SmartMenuSettings[]>
  > {
    const result = await this.getAll();
    const smartMenus = result.data;

    const filtered = smartMenus.filter(
      (sm) => sm.footerText && sm.footerText.trim() !== ""
    );

    return {
      data: filtered,
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: filtered.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Get classification statistics
   */
  async getClassificationStats(): Promise<
    BusinessLogicResult<{
      nraClassifications: Record<string, number>;
      menuTypes: Record<string, number>;
      cuisineTypes: Record<string, number>;
      orderingEnabled: number;
      orderingDisabled: number;
    }>
  > {
    const result = await this.getAll();
    const smartMenus = result.data;

    // NRA classifications
    const nraClassifications: Record<string, number> = {};
    smartMenus.forEach((sm) => {
      sm.chain_nra_classifications?.forEach((nra) => {
        nraClassifications[nra.nra_classification] =
          (nraClassifications[nra.nra_classification] || 0) + 1;
      });
    });

    // Menu types
    const menuTypes: Record<string, number> = {};
    smartMenus.forEach((sm) => {
      sm.chain_menu_classifications?.forEach((menu) => {
        menuTypes[menu.menu_type] = (menuTypes[menu.menu_type] || 0) + 1;
      });
    });

    // Cuisine types
    const cuisineTypes: Record<string, number> = {};
    smartMenus.forEach((sm) => {
      sm.chain_cuisine_classifications?.forEach((cuisine) => {
        cuisineTypes[cuisine.cuisine_type] =
          (cuisineTypes[cuisine.cuisine_type] || 0) + 1;
      });
    });

    // Ordering status
    const orderingEnabled = smartMenus.filter(
      (sm) => sm.isOrderButtonEnabled
    ).length;
    const orderingDisabled = smartMenus.length - orderingEnabled;

    return {
      data: {
        nraClassifications,
        menuTypes,
        cuisineTypes,
        orderingEnabled,
        orderingDisabled,
      },
      metrics: {
        totalCount: smartMenus.length,
        filteredCount: smartMenus.length,
        processingTime: 0,
        cacheHit: false,
      },
    };
  }

  /**
   * Calculate comprehensive SmartMenu metrics
   */
  private calculateSmartMenuMetrics(
    smartMenus: SmartMenuSettings[],
    quarterlyData: QuarterlyMetrics[]
  ): SmartMenuSettingsMetrics {
    const total = smartMenus.length;
    const active = smartMenus.filter((sm) => Boolean(sm.publishedAt)).length;
    const totalLocations = smartMenus.reduce(
      (sum, sm) => sum + (sm.numberOfLocations || 0),
      0
    );

    // Feature adoption
    const withImages = smartMenus.filter((sm) => sm.displayImages).length;
    const withOrderButton = smartMenus.filter(
      (sm) => sm.isOrderButtonEnabled
    ).length;
    const withByo = smartMenus.filter((sm) => sm.isByoEnabled).length;

    // Layout distribution
    const byLayout = smartMenus.reduce(
      (acc, sm) => {
        acc[sm.layout] = (acc[sm.layout] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Settings usage
    const withCustomColors = smartMenus.filter(
      (sm) => sm.primaryBrandColor || sm.highlightColor || sm.backgroundColor
    ).length;

    const withCustomFonts = smartMenus.filter(
      (sm) =>
        sm.buttonFont ||
        sm.categoryTitleFont ||
        sm.subheaderFont ||
        sm.navbarFont
    ).length;

    const withDietaryPreferences = smartMenus.filter(
      (sm) =>
        sm.supportedDietaryPreferences &&
        sm.supportedDietaryPreferences.length > 0
    ).length;

    const withAllergens = smartMenus.filter(
      (sm) => sm.supportedAllergens && sm.supportedAllergens.length > 0
    ).length;

    return {
      totalSmartMenus: total,
      activeSmartMenus: active,
      totalLocations,
      featureAdoption: {
        withImages,
        withOrderButton,
        withByo,
        byLayout,
      },
      quarterlyData,
      settings: {
        withCustomColors,
        withCustomFonts,
        withDietaryPreferences,
        withAllergens,
      },
    };
  }

  // Override validation methods for SmartMenu-specific validation
  protected validateFilters(
    filters: SmartMenuSettingsFilters
  ): ValidationResult {
    const errors: string[] = [];

    if (filters.layout && typeof filters.layout !== "string") {
      errors.push("Layout must be a string");
    }

    if (
      filters.isActive !== undefined &&
      typeof filters.isActive !== "boolean"
    ) {
      errors.push("isActive must be a boolean");
    }

    if (
      filters.isPublished !== undefined &&
      typeof filters.isPublished !== "boolean"
    ) {
      errors.push("isPublished must be a boolean");
    }

    if (
      filters.hasImages !== undefined &&
      typeof filters.hasImages !== "boolean"
    ) {
      errors.push("hasImages must be a boolean");
    }

    if (
      filters.hasOrderButton !== undefined &&
      typeof filters.hasOrderButton !== "boolean"
    ) {
      errors.push("hasOrderButton must be a boolean");
    }

    if (filters.hasByo !== undefined && typeof filters.hasByo !== "boolean") {
      errors.push("hasByo must be a boolean");
    }

    if (
      filters.hasLocations !== undefined &&
      typeof filters.hasLocations !== "boolean"
    ) {
      errors.push("hasLocations must be a boolean");
    }

    if (filters.timeRange && typeof filters.timeRange !== "object") {
      errors.push("timeRange must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Override processing methods for SmartMenu-specific processing
  protected processGetAllResult(
    data:
      | SmartMenuSettings[]
      | { db_widgetsList?: { items?: SmartMenuSettings[] } }
  ): SmartMenuSettings[] {
    // Handle the GraphQL response structure
    let items: SmartMenuSettings[];

    if (Array.isArray(data)) {
      // Direct array from base class
      items = data;
    } else {
      // GraphQL response object
      items = data?.db_widgetsList?.items || [];
    }

    // Ensure we have an array
    if (!Array.isArray(items)) {
      console.warn(
        "[SmartMenuSettingsService] Expected array but got:",
        typeof items,
        items
      );
      return [];
    }

    // Sort by publishedAt (active first), then by name
    return items.sort((a, b) => {
      if (a.publishedAt && !b.publishedAt) return -1;
      if (!a.publishedAt && b.publishedAt) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  protected processFilteredResult(
    data: SmartMenuSettings[]
  ): SmartMenuSettings[] {
    // Apply SmartMenu-specific filtering logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return data.filter((smartMenu) => {
      // This would be enhanced with actual filter logic
      // For now, just return all data
      return true;
    });
  }

  protected processSmartMenuSettingsResult(data: {
    db_widgetsList: {
      items: SmartMenuSettings[];
      pagination: { total: number };
    };
    quarterlyMetrics: QuarterlyMetrics[];
  }): {
    db_widgetsList: {
      items: SmartMenuSettings[];
      pagination: { total: number };
    };
    quarterlyMetrics: QuarterlyMetrics[];
  } {
    // Sort quarterly metrics by year and quarter
    const sortedQuarterlyMetrics = data.quarterlyMetrics.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

    return {
      db_widgetsList: data.db_widgetsList,
      quarterlyMetrics: sortedQuarterlyMetrics,
    };
  }

  // GraphQL query implementations
  protected getByIdQuery(): DocumentNode {
    return gql`
      query GetSmartMenuSettingsById($id: ID!) {
        db_widgetsList {
          items {
            id
            name
            slug
            createdAt
            updatedAt
            publishedAt
            numberOfLocations
            displayImages
            layout
            isOrderButtonEnabled
            isByoEnabled
            isActive
          }
        }
      }
    `;
  }

  protected getAllQuery(): DocumentNode {
    return gql`
      query GetSmartMenuSettings {
        db_widgetsList {
          items {
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
          pagination {
            total
          }
        }
      }
    `;
  }

  protected getFilteredQuery(): DocumentNode {
    return gql`
      query GetFilteredSmartMenuSettings($filters: SmartMenuSettingsFilters) {
        db_widgetsList(filters: $filters) {
          items {
            id
            name
            slug
            createdAt
            updatedAt
            publishedAt
            numberOfLocations
            displayImages
            layout
            isOrderButtonEnabled
            isByoEnabled
            isActive
          }
        }
      }
    `;
  }

  protected getRollupsQuery(): DocumentNode {
    return gql`
      query GetSmartMenuSettingsRollups($groupBy: [String!]!) {
        smartMenuSettingsRollups(groupBy: $groupBy) {
          group
          count
          metrics
        }
      }
    `;
  }

  protected getTrendsQuery(): DocumentNode {
    return gql`
      query GetSmartMenuSettingsTrends($timeRange: TimeRange!) {
        smartMenuSettingsTrends(timeRange: $timeRange) {
          period
          total
          active
          features
          settings
        }
      }
    `;
  }

  protected getSmartMenuSettingsQuery(): DocumentNode {
    return SMARTMENU_SETTINGS;
  }

  // Enhanced metrics calculation for SmartMenu settings
  protected calculateGetAllMetrics(
    data: SmartMenuSettings[],
    processingTime: number
  ): MetricsData {
    const activeCount = data.filter((sm) => Boolean(sm.publishedAt)).length;

    return {
      totalCount: data.length,
      filteredCount: activeCount,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateFilteredMetrics(
    data: SmartMenuSettings[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateSmartMenuSettingsMetrics(
    data: {
      db_widgetsList: {
        items: SmartMenuSettings[];
        pagination: { total: number };
      };
      quarterlyMetrics: QuarterlyMetrics[];
    },
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.db_widgetsList.items.length,
      filteredCount: data.db_widgetsList.items.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateTrendsMetrics(
    data: Record<string, unknown>[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }

  protected calculateRollupsMetrics(
    data: Record<string, unknown>[],
    processingTime: number
  ): MetricsData {
    return {
      totalCount: data.length,
      filteredCount: data.length,
      processingTime,
      cacheHit: false,
    };
  }
}
