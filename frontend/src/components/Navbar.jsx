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

  const isAdmin = user.role === "ADMIN";
  const isAgent = user.role === "AGENT";
  const isCustomer = user.role === "CUSTOMER";

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow flex-wrap gap-2">
      <div className="flex items-center gap-5 flex-wrap">
        <span className="font-bold text-lg">Insurance Platform</span>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>

        {(isAdmin || isAgent) && (
          <>
            <Link to="/customers" className="hover:underline">
              {isAgent ? "My Customers" : "Customers"}
            </Link>
            <Link to="/policy-plans" className="hover:underline">Policy Plans</Link>
            <Link to="/policies" className="hover:underline">Policies</Link>
            <Link to="/claims" className="hover:underline">Claims</Link>
            <Link to="/payments" className="hover:underline">Payments</Link>
          </>
        )}

        {isAdmin && <Link to="/staff" className="hover:underline">Manage Staff</Link>}

        {isCustomer && (
          <>
            <Link to="/my-profile" className="hover:underline">My Profile</Link>
            <Link to="/browse-plans" className="hover:underline">Browse Plans</Link>
            <Link to="/policies" className="hover:underline">My Policies</Link>
            <Link to="/claims" className="hover:underline">My Claims</Link>
            <Link to="/payments" className="hover:underline">Payments</Link>
          </>
        )}
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