import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import CustomerDashboard from "./CustomerDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (user.role === "ADMIN" || user.role === "AGENT") {
    return <AdminDashboard />;
  }
  return <CustomerDashboard />;
}