import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const registerHospital = async (formData) => {
    const data = await authService.registerHospital(formData);
    setUser(data.user);
    return data;
  };

  const registerPatient = async (formData) => {
    const data = await authService.registerPatient(formData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      return freshUser;
    } catch (e) {
      return null;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    isHospital: user?.role === 'hospital',
    isPatient: user?.role === 'patient',
    login,
    registerHospital,
    registerPatient,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
