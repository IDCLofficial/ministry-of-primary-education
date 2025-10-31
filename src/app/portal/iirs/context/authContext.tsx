"use client"
import { createContext, useContext, useState, ReactNode, FC, useEffect } from "react";
import { getProfile } from "@/lib/iirs/dataInteraction";

interface User {
  id: string;
  email: string;
  name: string;
  percentage?: number;
  state?: string;
  totalEarnings?: number;
  totalAmountProcessed?: number;
  adminType?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (userData: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (userData: User) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  setUser: (userData: User | null) => {},
  setIsAuthenticated: (isAuthenticated: boolean) => {},
  login: (userData: User) => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if(token){
        try {
          const profileData = await getProfile();
          if(profileData && profileData.id) {
            setIsAuthenticated(true);
            setUser(profileData);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          // Token validation failed, clear it
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };
    
    validateToken();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{user, setUser, isAuthenticated, setIsAuthenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

export default AuthContext;
