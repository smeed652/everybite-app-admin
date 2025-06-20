/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Amplify auth BEFORE imports are evaluated
vi.mock('aws-amplify/auth', () => {
  return {
    fetchAuthSession: vi.fn(),
  };
});

import { fetchAuthSession } from 'aws-amplify/auth';
const mockedFetch = vi.mocked(fetchAuthSession);

afterEach(() => {
  vi.resetAllMocks();
});

function renderWithRouter(element: React.ReactElement, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/403" element={<div>Forbidden</div>} />
        <Route path="/" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when not signed in', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('No session'));

    renderWithRouter(
      <ProtectedRoute>
        <div>Private</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });
  });

  it('redirects to /403 when user lacks required group', async () => {
    mockedFetch.mockResolvedValueOnce({
      accessToken: { payload: { 'cognito:groups': ['USER'] } },
    } as any);

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Private</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/forbidden/i)).toBeInTheDocument();
    });
  });

  it('renders children when authorised', async () => {
    mockedFetch.mockResolvedValueOnce({
      accessToken: { payload: { 'cognito:groups': ['ADMIN'] } },
    } as any);

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div>Private</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/private/i)).toBeInTheDocument();
    });
  });
});
