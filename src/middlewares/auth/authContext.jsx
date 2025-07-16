import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import { useGet } from "../../hooks/useApi";

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
    
    if (!decryptedString) {
      throw new Error("Failed to decrypt data");
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);  // Add a loading state to prevent redirects on first render
  const navigate = useNavigate();
  const { data: users, loading: apiLoading, error: apiError } = useGet("/employee/get-login-employee");

  // Load from localStorage
  useEffect(() => {

    const stored = localStorage.getItem("user");
    
    if (stored) {
      try {
        const decryptedData = decryptData(stored);
        
        if (decryptedData && decryptedData.data && decryptedData.expiry) {
          if (Date.now() < decryptedData.expiry) {
            console.log("Loaded user from localStorage:", decryptedData.data);
            setUser(decryptedData.data);
          } else {

            localStorage.removeItem("user");
          }
        } else {

          localStorage.removeItem("user");
        }
      } catch (error) {

        localStorage.removeItem("user");
      }
    } else {

    }
    
    setLoading(false);
  }, []);

  // Set user from API if not already set
  useEffect(() => {
 

    // Only proceed if we have API data and no current user
    if (users?.data && !user && !apiLoading) {
      try {
        const userData = users.data?.message.data;

        
        const expiry = Date.now() + 12 * 3600000; // 12 hours
        const dataToEncrypt = { data: userData, expiry };
        

        
        const encrypted = encryptData(dataToEncrypt);
        
        if (encrypted) {
          localStorage.setItem("user", encrypted);

          
          // Verify the data was saved correctly
          const verification = localStorage.getItem("user");
          const decryptedVerification = decryptData(verification);

          
          setUser(userData);

        } 
      } catch (error) {
        console.error("Error processing API user data:", error);
      }
    }
  }, [users, user, apiLoading, apiError]);

  const login = (userData) => {
    try {
      console.log("Manual login with data:", userData);
      
      const expiry = Date.now() + 12 * 3600000;
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

  // Logout function to clear localStorage and reset state
  const logout = () => {
    console.log("Logging out user...");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
   
  };

  // Global 401 handler
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        console.log("Axios interceptor triggered:", err.response?.status);
        if (err.response?.status === 401) {
          console.log("401 error detected, logging out...");
 window.location.href = user?.role === "superadmin"
    ? "https://auth.immultiverse.co/login?user=superAdmin&redirect=user.immultiverse.co"
    : "https://auth.immultiverse.co/login?user=employee&redirect=employee.immultiverse.co";
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Debug effect to track user state changes
  useEffect(() => {
    console.log("User state changed:", user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
}