// src/context/AuthContext.jsx
// Fixed - Backend integration with correct Bearer token

import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();
const API_URL = "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("vastravaani_token");
        const storedUser = localStorage.getItem("vastravaani_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        localStorage.removeItem("vastravaani_token");
        localStorage.removeItem("vastravaani_user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register handler
  const register = useCallback(async (email, password, name) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Registration failed");
      }

      localStorage.setItem("vastravaani_token", data.access_token);
      localStorage.setItem("vastravaani_user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      return true;
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      console.error("Register error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Login failed");
      }

      localStorage.setItem("vastravaani_token", data.access_token);
      localStorage.setItem("vastravaani_user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      return true;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user profile
  const getProfile = useCallback(async () => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/profile?token=${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return null;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("vastravaani_user", JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  }, [token]);

  // Update profile
  const updateProfile = useCallback(
    async (profileData) => {
      if (!token) {
        setError("Not authenticated");
        return false;
      }

      try {
        setError(null);
        const response = await fetch(`${API_URL}/auth/profile?token=${token}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to update profile");
        }

        setUser(data.user);
        localStorage.setItem("vastravaani_user", JSON.stringify(data.user));
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Update profile error:", err);
        return false;
      }
    },
    [token]
  );

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vastravaani_token");
    localStorage.removeItem("vastravaani_user");
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}