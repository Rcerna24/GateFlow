import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse, LoginPayload, RegisterPayload } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<AuthResponse>;
  register: (data: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('gateflow_token');
    const savedUser = localStorage.getItem('gateflow_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gateflow_user');
      }

      // Validate token by fetching profile
      authApi
        .me()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('gateflow_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('gateflow_token');
          localStorage.removeItem('gateflow_user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAuthResponse = useCallback((res: AuthResponse) => {
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('gateflow_token', res.accessToken);
    localStorage.setItem('gateflow_user', JSON.stringify(res.user));
  }, []);

  const login = useCallback(
    async (data: LoginPayload) => {
      const res = await authApi.login(data);
      handleAuthResponse(res);
      return res;
    },
    [handleAuthResponse],
  );

  const register = useCallback(
    async (data: RegisterPayload) => {
      const res = await authApi.register(data);
      handleAuthResponse(res);
      return res;
    },
    [handleAuthResponse],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gateflow_token');
    localStorage.removeItem('gateflow_user');
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    localStorage.setItem('gateflow_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
