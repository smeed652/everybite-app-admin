/* eslint-disable @typescript-eslint/no-explicit-any, react/prop-types */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import * as authLib from '../../lib/auth';
import { AuthContext } from '../../context/AuthContext';

// Mock the auth library functions used by Login
vi.mock('../../lib/auth', () => ({
  signIn: vi.fn(),
  currentSession: vi.fn(),
}));

/**
 * Custom wrapper to provide AuthContext and Router for the Login component
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={{ login: vi.fn() } as any}>
    <MemoryRouter>{children}</MemoryRouter>
  </AuthContext.Provider>
);

/** Helper to update input values */
const typeInto = (testId: string, value: string) => {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
};

describe('Login page', () => {
  const signInMock = authLib.signIn as unknown as ReturnType<typeof vi.fn>;
  const currentSessionMock = authLib.currentSession as unknown as ReturnType<typeof vi.fn>;
  const loginMock = vi.fn();

  beforeEach(() => {
    // Reset mocks and ensure wrapper uses a fresh loginMock each run
    vi.resetAllMocks();
  });

  it('logs in successfully and calls AuthContext.login', async () => {
    signInMock.mockResolvedValue({});
    currentSessionMock.mockResolvedValue({ tokens: { idToken: { toString: () => 'jwt-token' } } });

    render(<Login />, {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={{ login: loginMock } as any}>
          <MemoryRouter>{children}</MemoryRouter>
        </AuthContext.Provider>
      ),
    });

    typeInto('email', 'user@example.com');
    typeInto('password', 'password123');
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ accessToken: 'jwt-token' });
    });
  });

  it('displays error when signIn throws', async () => {
    signInMock.mockRejectedValue(new Error('Invalid credentials'));
    render(<Login />, { wrapper: TestWrapper });

    typeInto('email', 'bad@example.com');
    typeInto('password', 'wrong');
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
