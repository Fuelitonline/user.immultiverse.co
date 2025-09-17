// import React from "react";
// import { useLocation } from "react-router-dom";
// import { useAuth } from "./authContext";

// const PrivateRoute = ({ children }) => {
//   const { user } = useAuth();
//   if (user) {
//     return children;
//   }

// };

// export default PrivateRoute;

import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "./authContext";
import { ALLOWED_PORTALS } from "../../constants/portals";

const PrivateRoute = ({ currentPortal, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return null;

  // ✅ SuperAdmin bypass
  if (user.role?.toLowerCase() === "superadmin") {
    return children || <Outlet />;
  }

  // ✅ Check portal (local dev override)
  let portal = currentPortal;
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    portal =
      new URLSearchParams(window.location.search).get("portal") || "user";
  }

  // ✅ Access check
  if (user.access?.map((a) => a.toLowerCase()).includes(portal)) {
    return children || <Outlet />;
  }

  const redirectUrl =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? ALLOWED_PORTALS.user.local
      : ALLOWED_PORTALS.user.prod;

  window.location.href = redirectUrl;
  return null;
};

export default PrivateRoute;
