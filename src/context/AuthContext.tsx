import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(ACCESS_KEY));
  const [user, setUser] = useState(() => parseUser(accessToken));

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(ACCESS_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_KEY);
    }
    setUser(parseUser(accessToken));
  }, [accessToken]);

  const login = ({ accessToken: token }: LoginResponse) => {
    setAccessToken(token);
  };

  const logout = () => setAccessToken(null);

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
