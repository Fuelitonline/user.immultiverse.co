import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  return user?.role === 'Admin' || user?.role === 'superAdmin' || user?.role === 'Manager' ? children : <Navigate to="/" />;
};

export default AdminRoute;
