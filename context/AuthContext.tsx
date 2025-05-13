import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../data/types';
import { getCurrentUser, login, logout, register, isAuthenticated } from '../utils/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../utils/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ 
    success: boolean; 
    message: string;
    emailVerified?: boolean;
  }>;
  register: (name: string, email: string, password: string) => Promise<{ 
    success: boolean; 
    message: string;
    emailVerificationSent?: boolean;
  }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // User is signed in - the localStorage will be updated by our auth utility
        const storedUser = getCurrentUser();
        setUser(storedUser);
      } else {
        // User is signed out
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    setIsLoading(false);
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      setIsLoading(false);
      return { 
        success: result.success, 
        message: result.message,
        emailVerified: result.emailVerified
      };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await register(name, email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      setIsLoading(false);
      return { 
        success: result.success, 
        message: result.message,
        emailVerificationSent: result.emailVerificationSent
      };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    
    // Show notification
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('You have been logged out');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 