import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    department: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: 'Admin' | 'Department_Lead' | 'Analyst') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      const storedUser = localStorage.getItem('nexus_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify with /api/auth/me
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
        } catch {
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_user');
          setToken(null);
          setUser(null);
        }
      } else {
        // Auto-login default demo Admin on first load for friction-free enterprise review
        try {
          const res = await api.post('/auth/login', {
            email: 'admin@nexusai.corp',
            password: 'password123'
          });
          setToken(res.data.token);
          setUser(res.data.user);
          localStorage.setItem('nexus_token', res.data.token);
          localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
        } catch (e) {
          console.warn('Initial demo signin skipped:', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('nexus_token', res.data.token);
    localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    department: string;
    role: string;
  }) => {
    const res = await api.post('/auth/register', payload);
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('nexus_token', res.data.token);
    localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (targetRole: 'Admin' | 'Department_Lead' | 'Analyst') => {
    let email = 'admin@nexusai.corp';
    if (targetRole === 'Department_Lead') email = 'sarah.chen@nexusai.corp';
    if (targetRole === 'Analyst') email = 'marcus.vance@nexusai.corp';
    await login(email, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
