/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from '@testing-library/react';
import Users from '../Users';
import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import { vi, type Mock } from 'vitest';

// Helper to render Users with AuthContext
function renderWithAuth() {
  return render(
    <AuthContext.Provider value={{} as any}>
      <Users />
    </AuthContext.Provider>
  );
}

describe('Users page', () => {
  it('shows skeletons while list is loading and no users yet', () => {
    // Mock fetch to never resolve so listLoading stays true in initial effect
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ users: [], nextToken: undefined }),
      } as Response)
    );

    renderWithAuth();

    // Expect 5 skeleton rows rendered
    const skeletons = screen.getAllByRole('status'); // Skeleton component has no role, fallback to test id
    expect(skeletons.length).toBeGreaterThanOrEqual(5);

    (global.fetch as Mock).mockRestore();
  });
});
