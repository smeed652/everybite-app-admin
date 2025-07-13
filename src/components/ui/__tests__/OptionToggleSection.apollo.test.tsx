import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql, useQuery } from '@apollo/client';
import * as React from 'react';
import { OptionToggleSection } from '../OptionToggleSection';

// Simple query returning supportedDietaryPreferences field we care about
const GET_PREFS = gql`
  query GetPrefs {
    widget(id: "1") {
      id
      supportedDietaryPreferences
    }
  }
`;

// Harness that fetches the data via Apollo and forwards it to OptionToggleSection
function PrefsHarness() {
  const { data, loading } = useQuery(GET_PREFS);
  const [selected, setSelected] = React.useState<string[]>([]);

  if (loading) return <>Loading...</>;

  const dietOptions = ['VEGETARIAN', 'VEGAN', 'PESCATARIAN'] as const;

  return (
    <OptionToggleSection<string>
      title="Dietary Preferences"
      options={dietOptions}
      enabled={true}
      onToggleEnabled={() => {}}
      selected={selected.length ? selected : data.widget.supportedDietaryPreferences}
      onChangeSelected={setSelected}
    />
  );
}

describe('OptionToggleSection – Apollo integration', () => {
  const mocks = [
    {
      request: {
        query: GET_PREFS,
      },
      result: {
        data: {
          widget: {
            id: '1',
            __typename: 'Widget',
            supportedDietaryPreferences: ['VEGAN'],
          },
        },
      },
    },
  ];

  it('initially checks values provided by Apollo query and updates state on user interaction', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={true}>
        <PrefsHarness />
      </MockedProvider>
    );

    // Wait for query to resolve and component to re-render
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    // Apollo provided ["VEGAN"] so that box should be checked
    const veganCheckbox = screen.getByLabelText('VEGAN') as HTMLInputElement;
    const vegetarianCheckbox = screen.getByLabelText('VEGETARIAN') as HTMLInputElement;

    expect(veganCheckbox).toBeChecked();
    expect(vegetarianCheckbox).not.toBeChecked();

    // User toggles another option
    fireEvent.click(vegetarianCheckbox);

    // Checkbox should now be checked, representing updated component state
    expect(vegetarianCheckbox).toBeChecked();
  });
});
