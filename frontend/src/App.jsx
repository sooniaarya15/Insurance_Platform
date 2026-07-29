import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import PolicyPlans from "./pages/PolicyPlans";
import BrowsePlans from "./pages/BrowsePlans";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Payments from "./pages/Payments";
import MyProfile from "./pages/MyProfile";
import StaffManagement from "./pages/StaffManagement";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/customers" element={<ProtectedRoute roles={["ADMIN", "AGENT"]}><Customers /></ProtectedRoute>} />
      <Route path="/policy-plans" element={<ProtectedRoute roles={["ADMIN", "AGENT"]}><PolicyPlans /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute roles={["ADMIN"]}><StaffManagement /></ProtectedRoute>} />

      <Route path="/browse-plans" element={<ProtectedRoute roles={["CUSTOMER"]}><BrowsePlans /></ProtectedRoute>} />
      <Route path="/my-profile" element={<ProtectedRoute roles={["CUSTOMER"]}><MyProfile /></ProtectedRoute>} />

      <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
      <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
    </Routes>
  );
}