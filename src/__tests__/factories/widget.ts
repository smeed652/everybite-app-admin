/*
 * Factory helper for building mock SmartMenu Widget objects in tests and Storybook/MSW.
 * New fields `banners` and `menuItems` were added (Sprint 6 requirement).
 */

export type MockBanner = {
  id: string;
  imageUrl: string;
  altText?: string;
};

export type MockMenuItem = {
  id: string;
  name: string;
  price: number;
};

export interface MockWidget {
  id: string;
  name: string;
  layout: string;
  colors: Record<string, string>;
  syncEnabled: boolean;
  lastSyncedAt: string | null;
  banners: MockBanner[];
  menuItems: MockMenuItem[];
}

/**
 * Build a mock Widget object.
 * @param partial allow overriding any field.
 */
export function makeWidget(partial: Partial<MockWidget> = {}): MockWidget {
  return {
    id: 'widget_1',
    name: 'Lunch Menu',
    layout: 'classic',
    colors: {
      primary: '#1e40af',
      secondary: '#f59e0b',
    },
    syncEnabled: true,
    lastSyncedAt: new Date().toISOString(),
    banners: [
      {
        id: 'banner_1',
        imageUrl: 'https://placehold.co/600x200',
        altText: 'Summer specials',
      },
    ],
    menuItems: [
      {
        id: 'item_1',
        name: 'Margherita Pizza',
        price: 12.99,
      },
    ],
    ...partial,
  };
}
