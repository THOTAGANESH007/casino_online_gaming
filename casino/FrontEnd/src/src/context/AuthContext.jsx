import React, { createContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/auth";
import { storage } from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = storage.getToken();
    const savedUser = storage.getUser();

    if (token && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      storage.setToken(data.access_token);

      const userData = await authAPI.getCurrentUser();
      storage.setUser(userData);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const data = await authAPI.signup(userData);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Signup failed",
      };
    }
  }, []);

  const logout = useCallback(() => {
    storage.clearAll();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      storage.setUser(userData);
      setUser(userData);
      return userData;
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
    isAdmin: user?.role === "admin",
    isPlayer: user?.role === "player",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
