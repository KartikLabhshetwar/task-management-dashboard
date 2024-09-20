'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
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
      if (res.status === 200) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        router.push('/workspace');
      }
    } catch (e) {
      console.error('Login failed', e);
      toast.error('Failed to login. Please check your credentials.');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post('/api/users/register', { name, email, password });
      if (res.status === 201) {
        toast.success('Signup successful! Please log in.');
        router.push('/auth/login');
      }
    } catch (e) {
      console.error('Signup failed', e);
      toast.error('Failed to create an account. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Implement your toast logic here
    console.log(`${type.toUpperCase()}: ${message}`);
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
