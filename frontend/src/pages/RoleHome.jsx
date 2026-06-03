import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, isAuthenticated } from "../utils/auth";

function RoleHome() {
  if (!isAuthenticated()) return <Navigate to="/connexion" replace />;
  const user = getStoredUser();
  if (!user) return <Navigate to="/connexion" replace />;

  if (user.role === "student") return <Navigate to="/espace/etudiant" replace />;
  if (user.role === "teacher") return <Navigate to="/espace/enseignant" replace />;
  if (user.role === "admin") return <Navigate to="/espace/admin" replace />;
  return <Navigate to="/" replace />;
}

export default RoleHome;
