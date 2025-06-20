/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { GET_WIDGET, useWidget } from './useWidget';

// Complete widget stub matching all scalars selected in GET_WIDGET
const fullWidget = {
  id: 'w1',
  name: 'Widget One',
  slug: 'widget-one',
  layout: null,
  displayImages: null,
  isActive: true,
  isOrderButtonEnabled: null,
  primaryBrandColor: null,
  highlightColor: null,
  backgroundColor: null,
  orderUrl: null,
  supportedDietaryPreferences: null,
  displayIngredients: null,
  supportedAllergens: null,
  displayNutrientPreferences: null,
  displayMacronutrients: null,
  isByoEnabled: null,
  displaySoftSignUp: null,
  displayNotifyMeBanner: null,
  displayGiveFeedbackBanner: null,
  displayFeedbackButton: null,
  displayDishDetailsLink: null,
  displayNavbar: null,
  usePagination: null,
  displayFooter: null,
  footerText: null,
  buttonFont: null,
  buttonBackgroundColor: null,
  buttonTextColor: null,
  buttonBorderRadius: null,
  categoryTitleFont: null,
  categoryTitleTextColor: null,
  contentAreaGlobalColor: null,
  contentAreaColumnHeaderColor: null,
  subheaderFont: null,
  subheaderLocationTextColor: null,
  subheaderAdditionalTextColor: null,
  navbarFont: null,
  navbarFontSize: null,
  navbarBackgroundColor: null,
  logoUrl: null,
  logoWidth: null,
  faviconUrl: null,
  htmlTitleText: null,
  pageTitleText: null,
  pageTitleTextColor: null,
  numberOfLocations: null,
  numberOfLocationsSource: null,
  widgetLogoUrl: null,
  widgetUrl: null,
  isSyncEnabled: null,
  createdAt: null,
  updatedAt: null,
  publishedAt: null,
  __typename: 'Widget',
};

const widgetMock = {
  request: {
    query: GET_WIDGET,
    variables: { id: 'w1' },
  },
  result: {
    data: {
      widget: fullWidget,
    },
  },
};

describe('useWidget hook', () => {
  it('returns widget data on success', async () => {
    const { result } = renderHook(() => useWidget('w1'), {
      wrapper: ({ children }) => <MockedProvider mocks={[widgetMock]} addTypename={true}>{children}</MockedProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.widget?.id).toBe('w1');
    expect(result.current.error).toBeUndefined();
  });

  it('sets error on GraphQL failure', async () => {
    const errorMocks = [{ ...widgetMock, error: new Error('GraphQL error') }];
    const { result } = renderHook(() => useWidget('w1'), {
      wrapper: ({ children }) => <MockedProvider mocks={errorMocks}>{children}</MockedProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
  });
});
