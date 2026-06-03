import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, isAuthenticated } from "../utils/auth";

function RoleGuard({ allow = [], children }) {
  if (!isAuthenticated()) return <Navigate to="/connexion" replace />;
  const user = getStoredUser();
  if (!user || (allow.length > 0 && !allow.includes(user.role))) return <Navigate to="/" replace />;
  return children;
}

export default RoleGuard;
