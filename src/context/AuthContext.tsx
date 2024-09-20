'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  const setAuthToken = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      if (res.status === 200 && res.data.token) {
        setAuthToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        showToast('Login successful!', 'success');
        router.push('/workspace');
      }
    } catch (e) {
      console.error('Login failed', e);
      showToast('Failed to login. Please check your credentials.', 'error');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/users/register', { name, email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setUser(response.data);
      setIsAuthenticated(true);
      showToast('Signup successful', 'success');
      router.push('/auth/login');
    } catch (error) {
      console.error('Signup error:', error);
      showToast('Signup failed', 'error');
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'success');
    router.push('/auth/login');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    toast[type](message);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, signup, logout, checkAuthStatus, showToast }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
