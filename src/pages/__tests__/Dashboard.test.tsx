import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import * as apollo from '@apollo/client';

// Mock Apollo useQuery to return fake data
const widgetsMock = [
  { id: '1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), publishedAt: null },
  { id: '2', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), publishedAt: new Date().toISOString() },
];

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual<typeof apollo>('@apollo/client');
  return {
    ...actual,
    useQuery: () => ({ data: { widgets: widgetsMock }, loading: false, error: null }),
  };
});

describe('Dashboard page', () => {
  it('renders metrics cards with correct counts', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText(/^SmartMenus$/i).nextSibling?.textContent).toBe('2');
    expect(screen.getByText(/^Active SmartMenus$/i).nextSibling?.textContent).toBe('1');
  });
});
