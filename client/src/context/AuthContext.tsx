import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  apiUrl: string;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Environment & Backend API URL resolution
// Toggle between 'development' and 'production' via VITE_APP_ENV or set VITE_API_URL directly
const appEnv = (import.meta.env.VITE_APP_ENV || 'development').toLowerCase();
const devApiUrl = import.meta.env.VITE_API_URL_DEV || 'http://localhost:4000';
const prodApiUrl = import.meta.env.VITE_API_URL_PROD || 'https://form-enclave-qg7w.onrender.com';

const apiUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : (appEnv === 'production' ? prodApiUrl : devApiUrl);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('formenclave_token') ||
    localStorage.getItem('formguard_token') ||
    localStorage.getItem('ember_token')
  );

  const [user, setUser] = useState<User | null>(() => {
    const saved =
      localStorage.getItem('formenclave_user') ||
      localStorage.getItem('formguard_user') ||
      localStorage.getItem('ember_user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('formenclave_token', newToken);
    localStorage.setItem('formenclave_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('formenclave_token');
    localStorage.removeItem('formenclave_user');
    localStorage.removeItem('formguard_token');
    localStorage.removeItem('formguard_user');
    localStorage.removeItem('ember_token');
    localStorage.removeItem('ember_user');
    setToken(null);
    setUser(null);
  };

  React.useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          logout();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('formenclave_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        logout();
      });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, apiUrl, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
