import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    // Public self-registration always creates a CUSTOMER account
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  }

  async function resetPassword(email, newPassword) {
    const res = await api.post("/auth/reset-password", { email, newPassword });
    return res.data;
  }

  async function createStaff(name, email, password, role) {
    // Admin-only: create AGENT or ADMIN accounts
    const res = await api.post("/auth/create-staff", { name, email, password, role });
    return res.data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, createStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}