"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin } from '@/services/schoolService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use the adminLogin function from schoolService
      const success = await adminLogin(email, password);
      
      if (success) {
        setIsAuthenticated(true);
        console.log('Login successful, token received');
        return true;
      } else {
        console.error('Login failed - no token received');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message === 'Failed to login') {
          console.error('Invalid credentials or server error');
        } else {
          console.error('Unexpected error:', error.message);
        }
      }
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    console.log('User logged out, all auth data cleared');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
