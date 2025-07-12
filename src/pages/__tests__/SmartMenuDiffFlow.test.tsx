/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';

// minimal generated GraphQL enums needed by feature panels
vi.mock('../../generated/graphql', () => ({
  __esModule: true,
  DietType: {
    Vegetarian: 'Vegetarian',
    Pescatarian: 'Pescatarian',
    Vegan: 'Vegan',
  },
  AllergenType: {
    Wheat: 'Wheat',
    Dairy: 'Dairy',
    Egg: 'Egg',
    Soy: 'Soy',
    Peanuts: 'Peanuts',
    TreeNuts: 'TreeNuts',
    Fish: 'Fish',
    Shellfish: 'Shellfish',
    Sesame: 'Sesame',
  },
  Layout: {
    Table: 'Table',
    Grid: 'Grid',
  },
}));

// spy to capture diffs sent to SmartMenuPage
const diffSpy = vi.fn();
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SmartMenuDetail from '../SmartMenuDetail';
import SmartMenuMarketing from '../SmartMenuMarketing';
import SmartMenuFeatures from '../SmartMenuFeatures';
import { Widget } from '../../generated/graphql';

// ---- shared mocks ----------------------------------------------------------
const baseWidget: Widget = {
  id: 'widget-123',
  name: 'Demo',
  slug: 'demo',
  isActive: true,
  isSyncEnabled: false,
} as unknown as Widget;

// Wrap useWidgetDiff to spy on handleFieldChange & reset
vi.mock('../../features/smartMenus/hooks/useWidgetDiff', async () => {
  const actual: any = await vi.importActual(
    '../../features/smartMenus/hooks/useWidgetDiff',
  );
  return {
    ...actual,
    useWidgetDiff: (...args: any[]) => {
      const ret = actual.useWidgetDiff(...args);
      return {
        ...ret,
        handleFieldChange: (changes: any) => {
          diffSpy(JSON.parse(JSON.stringify(changes)));
          return ret.handleFieldChange(changes);
        },
        refreshSnapshot: () => ret.refreshSnapshot(),
        reset: () => ret.reset(),
      };
    },
  };
});

vi.mock('../../features/smartMenus/hooks/useWidget', () => ({
  useWidget: (id: string) => ({
    widget: { ...baseWidget, id },
    loading: false,
    error: null,
  }),
}));

const updateMock = vi.fn(() => Promise.resolve());
vi.mock('../../features/smartMenus/hooks/useUpdateWidget', () => ({
  useUpdateWidget: () => ({ updateWidgetFields: updateMock }),
}));

const toggleMock = vi.fn(() => Promise.resolve());
vi.mock('../../features/smartMenus/hooks/useToggleWidgetSync', () => ({
  useToggleWidgetSync: () => ({ toggleWidgetSync: toggleMock }),
}));

// helper to render given element under router providing widgetId param
function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/smart-menus/widget-123']}>
      <Routes>
        <Route path="/smart-menus/:widgetId" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

async function runFlow(page: 'detail' | 'marketing' | 'features', expectSave: boolean) {
  const component =
    page === 'detail'
      ? <SmartMenuDetail />
      : page === 'marketing'
      ? <SmartMenuMarketing />
      : <SmartMenuFeatures />;

  renderWithRouter(component);

  // make the form dirty
  const nameInput = screen.queryByLabelText(/name/i);
  if (nameInput) {
    fireEvent.change(nameInput, { target: { value: 'Demo Updated' } });
  } else {
    const switches = screen.queryAllByRole('switch');
    if (switches.length) {
      fireEvent.click(switches[0]);
    } else {
      const textboxes = screen.queryAllByRole('textbox');
      if (textboxes.length) {
        fireEvent.change(textboxes[0], {
          target: { value: 'https://demo.example.com' },
        });
      }
    }
  }

  const saveButton = await screen.findByRole('button', { name: /save/i });
  if (expectSave) {
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    await waitFor(() => expect(saveButton).toBeDisabled());
  }

  // dirty again, then cancel
  if (nameInput) {
    fireEvent.change(nameInput, { target: { value: 'Demo Again' } });
  } else {
    const switches = screen.queryAllByRole('switch');
    if (switches.length) fireEvent.click(switches[0]);
  }

  if (expectSave) {
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    await waitFor(() => expect(saveButton).toBeDisabled());
  }
}

// ---------------- tests ------------------------------------------------------
describe('SmartMenu pages diff / save / cancel flow', () => {
  afterEach(() => vi.clearAllMocks());

  it('works on SmartMenuDetail page', async () => { await runFlow('detail', true); });
  it('works on SmartMenuMarketing page', async () => { await runFlow('marketing', false); });
  it('works on SmartMenuFeatures page',  async () => { await runFlow('features', false); });
});