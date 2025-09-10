import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import { useGet, usePost } from "../../hooks/useApi";

const AuthContext = createContext();

// Encryption helpers
const encryptData = (data) => {
  try {
    const secretKey = import.meta.env.VITE_SECRET_KEY || "default-secret";
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

const decryptData = (encryptedData) => {
  try {
    const secretKey = import.meta.env.VITE_SECRET_KEY || "default-secret";
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) throw new Error("Failed to decrypt data");
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { data: users, loading: apiLoading, error: apiError } = useGet(
    "/employee/get-login-employee"
  );

  const logoutuser = usePost('/logout');

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      const decryptedData = decryptData(storedUser);

      if (decryptedData && decryptedData.data && decryptedData.expiry) {
        if (Date.now() < decryptedData.expiry) {
          setUser(decryptedData.data);
          setToken(storedToken);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
        }
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setLoading(false);
  }, []);

  // Set user from API if not already set or when token changes
  useEffect(() => {
    if (users?.data && !user && !apiLoading) {
      try {
        const userData = users.data?.message.data;

        const expiry = Date.now() + 12 * 3600000; // 12 hours
        const dataToEncrypt = { data: userData, expiry };
        const encrypted = encryptData(dataToEncrypt);

        if (encrypted) {
          localStorage.setItem("user", encrypted);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error processing API user data:", error);
      }
    }
  }, [users, user, apiLoading, apiError, token]);

  // Login function
  const login = (userData, authToken) => {
    try {
      console.log("Logging in new user...");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      if (authToken) {
        localStorage.setItem("authToken", authToken);
        setToken(authToken);
      }

      const expiry = Date.now() + 12 * 3600000; // 12 hours
      const dataToEncrypt = { data: userData, expiry };
      const encrypted = encryptData(dataToEncrypt);

      if (encrypted) {
        localStorage.setItem("user", encrypted);
        setUser(userData);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Logout function with single-line role-based redirect
  const logout = async() => {
    console.log("Logging out user...");
    const role = user?.role; // store role before clearing
    localStorage.clear();
    setUser(null);
    setToken(null);
    await logoutuser.mutateAsync()
    // Single-line role-based redirect
    window.location.href =
      role === "superAdmin"
        ? "https://auth.immultiverse.co/login?user=user&redirect=admin.immultiverse.co"
        : "https://auth.immultiverse.co/login?user=employee&redirect=user.immultiverse.co";
  };

  // Global 401 handler
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          console.log("401 error detected, logging out...");
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [user]);

  // Debug: track user state
  useEffect(() => {
    console.log("User state changed:", user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};