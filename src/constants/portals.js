// src/constants/portals.js

export const ALLOWED_PORTALS = {
  user: {
    prod:  import.meta.env.VITE_USER_URL || "user.immultiverse.co",
    local: "/?portal=user", // localhost par root
  },
  lms: {
    // prod: "lms.immultiverse.co",
    prod: import.meta.env.VITE_LMS_URL || "lms.immultiverse.co",
    local: "/?portal=lms", // localhost par query param
  },
  hrm: {
    // prod: "hr.immultiverse.co",
    prod: import.meta.env.VITE_HRM_URL || "hr.immultiverse.co",
    local: "/?portal=hrm", // localhost par query param
  },
};
