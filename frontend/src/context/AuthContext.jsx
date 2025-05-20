import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to fetch the user profile with the JWT from the cookie
        const userResponse = await api.get("/users/me");
        if (userResponse.data) {
          // The /users/me endpoint returns the user object directly
          setUser(userResponse.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);
  const login = async (email, password) => {
    try {
      const res = await api.post("/users/login", { email, password });
      if (res.data && res.data.status === "success") {
        // Extract user from the response data structure
        const user = res.data.data.user;
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return {
        success: false,
        message:
          res.data?.message || "Login failed. Please check your credentials.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };
  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      if (response.data && response.data.status === "success") {
        return { success: true };
      }
      return {
        success: false,
        message:
          response.data?.message || "Registration failed. Please try again.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };
  const logout = async () => {
    try {
      await api.post("/users/logout");
      setIsAuthenticated(false);
      setUser(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Logout failed. Please try again.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
