// src/constants/portals.js

export const ALLOWED_PORTALS = {
  user: {
    prod: import.meta.env.VITE_USER_URL || "https://user.immultiverse.co",
    local: "/?portal=user",
  },
  lms: {
    prod: import.meta.env.VITE_LMS_URL || "https://lms.immultiverse.co",
    local: "/?portal=lms", 
  },
  hrm: {
    prod: import.meta.env.VITE_HRM_URL || "https://hr.immultiverse.co",
    local: "/?portal=hrm",
  },
  admin: {
    prod: import.meta.env.VITE_ADMIN_URL || "https://admin.immultiverse.co",
    local: "/?portal=hrm",
  }
};
