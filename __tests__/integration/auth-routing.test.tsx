// @ts-nocheck
/// <reference types="vitest" />
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';

vi.mock('aws-amplify/auth', () => ({ fetchAuthSession: vi.fn() }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchAuthSession } = require('aws-amplify/auth');

function renderRouter(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/403" element={<div>Forbidden</div>} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <div>Users Page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Auth routing integration', () => {
  afterEach(() => vi.resetAllMocks());

  it('redirects unauthenticated user to /login', async () => {
    (fetchAuthSession as vi.Mock).mockRejectedValueOnce(new Error('No session'));
    const { getByText } = renderRouter(['/users']);
    await waitFor(() => expect(getByText(/login page/i)).toBeInTheDocument());
  });

  it('redirects non-admin to /403', async () => {
    (fetchAuthSession as vi.Mock).mockResolvedValueOnce({
      accessToken: { payload: { 'cognito:groups': ['USER'] } },
    });
    const { getByText } = renderRouter(['/users']);
    await waitFor(() => expect(getByText(/forbidden/i)).toBeInTheDocument());
  });

  it('allows admin to view page', async () => {
    (fetchAuthSession as vi.Mock).mockResolvedValueOnce({
      accessToken: { payload: { 'cognito:groups': ['ADMIN'] } },
    });
    const { getByText } = renderRouter(['/users']);
    await waitFor(() => expect(getByText(/users page/i)).toBeInTheDocument());
  });
});
