import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./authContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return children;
  }

};

export default PrivateRoute;