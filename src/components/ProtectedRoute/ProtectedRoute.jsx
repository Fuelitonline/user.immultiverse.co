// src/components/ProtectedRoute.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../middlewares/auth/authContext";
import { ALLOWED_PORTALS } from "../../constants/portals";

// const ProtectedRoute = ({ currentPortal }) => {
//   const { user, loading } = useAuth();

//   if (loading) return null; // loader dikha sakte ho

//   // agar login nahi hai
//   if (!user) {
//     return <Navigate to="https://auth.immultiverse.co/login" replace />;
//   }

//   // agar user ke pass access hai
//   if (user.portals?.includes(currentPortal)) {
//     return <Outlet />; // nested routes ko render karega
//   }

//   // agar access nahi hai → default user portal par bhejo
//   return <Navigate to={`${ALLOWED_PORTALS.user}`} replace />;
// };

// export default ProtectedRoute;


const ProtectedRoute = ({ currentPortal }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Agar login nahi hai
  if (!user) {
    window.location.href = "https://auth.immultiverse.co/login";
    return null;
  }

  // ✅ SuperAdmin ke liye bypass
  if (user.role?.toLowerCase() === "superadmin") {
    return <Outlet />;
  }

  // Local override
  let portal = currentPortal;
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    portal =
      new URLSearchParams(window.location.search).get("portal") || "user";
  }

  // Agar access hai
  if (user.access?.map((a) => a.toLowerCase()).includes(portal)) {
    return <Outlet />;
  }

  // Agar access nahi hai → default user portal
  const currentHost = window.location.hostname;
  const redirectUrl =
    currentHost === "localhost" || currentHost === "127.0.0.1"
      ? ALLOWED_PORTALS.user.local
      : `https://${ALLOWED_PORTALS.user.prod}`;

  window.location.href = redirectUrl;
  return null;
};

export default ProtectedRoute;
