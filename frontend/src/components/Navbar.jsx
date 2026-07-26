import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) return null;

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">Insurance Platform</span>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/customers" className="hover:underline">Customers</Link>
        <Link to="/policies" className="hover:underline">Policies</Link>
        <Link to="/claims" className="hover:underline">Claims</Link>
        <Link to="/payments" className="hover:underline">Payments</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user.name} ({user.role})</span>
        <button
          onClick={handleLogout}
          className="bg-blue-900 hover:bg-blue-800 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}