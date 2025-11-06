"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdminLoginMutation } from '@/app/admin/schools/store/api/schoolsApi';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const [adminLogin] = useAdminLoginMutation()

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('admin_token') || "n/a";
    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(()=>{
    if (token === null) return;
    if (token !== "n/a") {
      setIsAuthenticated(true);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use the adminLogin function from schoolService
      const success = await adminLogin({
        email, password
      });

      if (!success.error) {
        setIsAuthenticated(true);
        console.log('Login successful, token received');
        router.push('/admin/schools');
        return true;
      } else {
        throw new Error('Login failed - no token received');
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setToken(null);
    router.replace('/');
    console.log('User logged out, all auth data cleared');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, token }}>
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
