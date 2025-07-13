import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeaturesPanel } from '../FeaturesPanel';
import type { Widget } from '../../../../generated/graphql';

// Minimal stub for Widget type with only the fields FeaturesPanel reads.
function makeWidget(partial: Partial<Widget>): Widget {
  return {
    id: '1',
    name: 'Test',
    slug: 'test',
    layout: 'FULL',
    displayImages: false,
    isActive: true,
    isOrderButtonEnabled: false,
    primaryBrandColor: null,
    highlightColor: null,
    backgroundColor: null,
    orderUrl: null,
    supportedDietaryPreferences: [],
    displayIngredients: false,
    supportedAllergens: [],
    displayNutrientPreferences: false,
    displayMacronutrients: false,
    isByoEnabled: false,
    displaySoftSignUp: false,
    displayNotifyMeBanner: false,
    displayGiveFeedbackBanner: false,
    displayFeedbackButton: false,
    displayDishDetailsLink: false,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    // spread overrides
    ...partial,
  } as Widget;
}

describe('FeaturesPanel – enum normalisation', () => {
  const widget = makeWidget({
    supportedDietaryPreferences: ['Vegetarian'],
    supportedAllergens: ['TreeNut', 'Wheat'],
  });

  it('pre-selects checkboxes based on API values (including CamelCase)', () => {
    render(<FeaturesPanel widget={widget} onFieldChange={() => {}} />);

    // Diets
    expect(screen.getByLabelText('Vegetarian')).toBeChecked();
    expect(screen.getByLabelText('Vegan')).not.toBeChecked();

    // Allergens
    expect(screen.getByLabelText('Tree Nut')).toBeChecked();
    expect(screen.getByLabelText('Wheat')).toBeChecked();
    expect(screen.getByLabelText('Peanut')).not.toBeChecked();
  });
});
