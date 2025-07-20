import { useEffect, useState } from "react";
import {
  QuarterlyMetricsHybrid,
  SmartMenuSettingsHybrid,
  SmartMenuSettingsHybridService,
} from "../services/smartmenus/SmartMenuSettingsHybridService";

interface UseSmartMenuSettingsResult {
  // Data
  smartMenus: SmartMenuSettingsHybrid[];
  quarterlyMetrics: QuarterlyMetricsHybrid[];

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Calculated metrics
  metrics: {
    totalSmartMenus: number;
    activeSmartMenus: number;
    totalLocations: number;
    featureAdoption: {
      withImages: number;
      withOrderButton: number;
      withByo: number;
      byLayout: Record<string, number>;
    };
    settings: {
      withCustomColors: number;
      withCustomFonts: number;
      withDietaryPreferences: number;
      withAllergens: number;
    };
    classifications: {
      nraClassifications: Record<string, number>;
      menuTypes: Record<string, number>;
      cuisineTypes: Record<string, number>;
      orderingEnabled: number;
      orderingDisabled: number;
    };
  };

  // Service methods
  getByLayout: (layout: string) => Promise<SmartMenuSettingsHybrid[]>;
  getActiveSmartMenus: () => Promise<SmartMenuSettingsHybrid[]>;
  getSmartMenusWithFeature: (
    feature: "images" | "orderButton" | "byo" | "locations"
  ) => Promise<SmartMenuSettingsHybrid[]>;
  getSmartMenusWithOrdering: () => Promise<SmartMenuSettingsHybrid[]>;
  getByNRAClassification: (
    nraClass: string
  ) => Promise<SmartMenuSettingsHybrid[]>;
  getByMenuType: (menuType: string) => Promise<SmartMenuSettingsHybrid[]>;
  getByCuisineType: (cuisineType: string) => Promise<SmartMenuSettingsHybrid[]>;
  getSmartMenusWithFooter: () => Promise<SmartMenuSettingsHybrid[]>;
  getSmartMenusWithCustomFooterText: () => Promise<SmartMenuSettingsHybrid[]>;
  refresh: () => Promise<void>;
}

/**
 * Hook for comprehensive SmartMenu settings data using the hybrid service
 *
 * This hook provides access to all SmartMenu data through the SmartMenuSettingsHybridService,
 * including settings, analytics, classifications, and quarterly metrics with proper caching.
 */
export function useSmartMenuSettings(): UseSmartMenuSettingsResult {
  const [smartMenus, setSmartMenus] = useState<SmartMenuSettingsHybrid[]>([]);
  const [quarterlyMetrics, setQuarterlyMetrics] = useState<
    QuarterlyMetricsHybrid[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<UseSmartMenuSettingsResult["metrics"]>(
    {
      totalSmartMenus: 0,
      activeSmartMenus: 0,
      totalLocations: 0,
      featureAdoption: {
        withImages: 0,
        withOrderButton: 0,
        withByo: 0,
        byLayout: {},
      },
      settings: {
        withCustomColors: 0,
        withCustomFonts: 0,
        withDietaryPreferences: 0,
        withAllergens: 0,
      },
      classifications: {
        nraClassifications: {},
        menuTypes: {},
        cuisineTypes: {},
        orderingEnabled: 0,
        orderingDisabled: 0,
      },
    }
  );

  // Initialize hybrid service
  const service = new SmartMenuSettingsHybridService();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get comprehensive SmartMenu settings from hybrid service
      const result = await service.getSmartMenuSettings();
      const { smartMenus: menus, quarterlyMetrics: quarterly } = result;

      setSmartMenus(menus);
      setQuarterlyMetrics(quarterly);

      // Calculate metrics from the data
      const calculatedMetrics = calculateMetrics(menus);
      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load SmartMenu settings"
      );
      console.error("Error loading SmartMenu settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics from SmartMenu data
  const calculateMetrics = (menus: SmartMenuSettingsHybrid[]) => {
    const totalSmartMenus = menus.length;
    const activeSmartMenus = menus.filter((m) => m.publishedAt).length;
    const totalLocations = menus.reduce(
      (sum, m) => sum + (m.numberOfLocations || 0),
      0
    );

    // Feature adoption
    const withImages = menus.filter((m) => m.displayImages).length;
    const withOrderButton = menus.filter((m) => m.isOrderButtonEnabled).length;
    const withByo = menus.filter((m) => m.isByoEnabled).length;
    const byLayout = menus.reduce(
      (acc, m) => {
        acc[m.layout] = (acc[m.layout] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Settings
    const withCustomColors = menus.filter(
      (m) => m.primaryBrandColor || m.highlightColor || m.backgroundColor
    ).length;
    const withCustomFonts = 0; // Not available in hybrid data
    const withDietaryPreferences = 0; // Not available in hybrid data
    const withAllergens = menus.filter(
      (m) => m.supportedAllergens && m.supportedAllergens.length > 0
    ).length;

    // Classifications
    const nraClassifications = menus.reduce(
      (acc, m) => {
        if (m.chain_nra_classifications) {
          m.chain_nra_classifications.forEach((c) => {
            acc[c.nra_classification] = (acc[c.nra_classification] || 0) + 1;
          });
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const menuTypes = menus.reduce(
      (acc, m) => {
        if (m.chain_menu_classifications) {
          m.chain_menu_classifications.forEach((c) => {
            acc[c.menu_type] = (acc[c.menu_type] || 0) + 1;
          });
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const cuisineTypes = menus.reduce(
      (acc, m) => {
        if (m.chain_cuisine_classifications) {
          m.chain_cuisine_classifications.forEach((c) => {
            acc[c.cuisine_type] = (acc[c.cuisine_type] || 0) + 1;
          });
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const orderingEnabled = menus.filter((m) => m.isOrderButtonEnabled).length;
    const orderingDisabled = menus.filter(
      (m) => !m.isOrderButtonEnabled
    ).length;

    return {
      totalSmartMenus,
      activeSmartMenus,
      totalLocations,
      featureAdoption: {
        withImages,
        withOrderButton,
        withByo,
        byLayout,
      },
      settings: {
        withCustomColors,
        withCustomFonts,
        withDietaryPreferences,
        withAllergens,
      },
      classifications: {
        nraClassifications,
        menuTypes,
        cuisineTypes,
        orderingEnabled,
        orderingDisabled,
      },
    };
  };

  // Service method wrappers
  const getByLayout = async (
    layout: string
  ): Promise<SmartMenuSettingsHybrid[]> => {
    return smartMenus.filter((m) => m.layout === layout);
  };

  const getActiveSmartMenus = async (): Promise<SmartMenuSettingsHybrid[]> => {
    return smartMenus.filter((m) => m.publishedAt);
  };

  const getSmartMenusWithFeature = async (
    feature: "images" | "orderButton" | "byo" | "locations"
  ): Promise<SmartMenuSettingsHybrid[]> => {
    switch (feature) {
      case "images":
        return smartMenus.filter((m) => m.displayImages);
      case "orderButton":
        return smartMenus.filter((m) => m.isOrderButtonEnabled);
      case "byo":
        return smartMenus.filter((m) => m.isByoEnabled);
      case "locations":
        return smartMenus.filter((m) => (m.numberOfLocations || 0) > 0);
      default:
        return [];
    }
  };

  const getSmartMenusWithOrdering = async (): Promise<
    SmartMenuSettingsHybrid[]
  > => {
    return smartMenus.filter((m) => m.isOrderButtonEnabled);
  };

  const getByNRAClassification = async (
    nraClass: string
  ): Promise<SmartMenuSettingsHybrid[]> => {
    return smartMenus.filter((m) =>
      m.chain_nra_classifications?.some(
        (c) => c.nra_classification === nraClass
      )
    );
  };

  const getByMenuType = async (
    menuType: string
  ): Promise<SmartMenuSettingsHybrid[]> => {
    return smartMenus.filter((m) =>
      m.chain_menu_classifications?.some((c) => c.menu_type === menuType)
    );
  };

  const getByCuisineType = async (
    cuisineType: string
  ): Promise<SmartMenuSettingsHybrid[]> => {
    return smartMenus.filter((m) =>
      m.chain_cuisine_classifications?.some(
        (c) => c.cuisine_type === cuisineType
      )
    );
  };

  const getSmartMenusWithFooter = async (): Promise<
    SmartMenuSettingsHybrid[]
  > => {
    return smartMenus.filter(
      (m) =>
        m.displaySoftSignUp ||
        m.displayNotifyMeBanner ||
        m.displayGiveFeedbackBanner ||
        m.displayFeedbackButton
    );
  };

  const getSmartMenusWithCustomFooterText = async (): Promise<
    SmartMenuSettingsHybrid[]
  > => {
    // This feature is not available in the hybrid data structure
    return [];
  };

  const refresh = async (): Promise<void> => {
    await loadData();
  };

  return {
    // Data
    smartMenus,
    quarterlyMetrics,

    // Loading and error states
    loading,
    error,

    // Calculated metrics
    metrics,

    // Service methods
    getByLayout,
    getActiveSmartMenus,
    getSmartMenusWithFeature,
    getSmartMenusWithOrdering,
    getByNRAClassification,
    getByMenuType,
    getByCuisineType,
    getSmartMenusWithFooter,
    getSmartMenusWithCustomFooterText,
    refresh,
  };
}
