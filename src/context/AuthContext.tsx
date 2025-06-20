import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { signOut as amplifySignOut, currentSession } from '../lib/auth';

type AuthState = {
  accessToken: string | null;
  user: { sub: string } | null;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

interface AuthContextValue extends AuthState {
  login: (tokens: LoginResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseUser(token: string | null): { sub: string } | null {
  if (!token) return null;
  try {
    return jwtDecode<{ sub: string }>(token);
  } catch {
    return null;
  }
}

const ACCESS_KEY = 'eb_access_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ sub: string } | null>(null);

  // On mount, pull freshest session/token from Amplify
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await currentSession();
        const token = session.tokens?.idToken?.toString() ?? null;
        setAccessToken(token);
        setUser(parseUser(token));
        if (token) localStorage.setItem(ACCESS_KEY, token); // keep legacy fallback
      } catch {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem(ACCESS_KEY);
      }
    };
    loadSession();
  }, []);

  // Keep user in sync when accessToken changes manually (e.g., via login)
  useEffect(() => {
    setUser(parseUser(accessToken));
    if (accessToken) {
      localStorage.setItem(ACCESS_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_KEY);
    }
  }, [accessToken]);

  const login = ({ accessToken: token }: LoginResponse) => {
    setAccessToken(token);
  };

  const logout = async () => {
    try {
      await amplifySignOut();
    } catch {
      // network or auth errors can be ignored
    }
    setAccessToken(null);
    // Force navigation so that stale ProtectedRoute instances unmount
    window.location.assign('/login');
  };

  return <AuthContext.Provider value={{ accessToken, user, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
