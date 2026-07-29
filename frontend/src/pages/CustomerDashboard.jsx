import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/reports/my-summary")
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load summary"));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>

        {error && <p className="text-red-600">{error}</p>}
        {!summary && !error && <p>Loading...</p>}

        {summary && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card title="Total Policies" value={summary.totalPolicies} color="bg-blue-600" />
              <Card title="Active Policies" value={summary.activePolicies} color="bg-green-600" />
              <Card title="Pending Applications" value={summary.pendingPolicies} color="bg-yellow-600" />
              <Card title="Premium Due" value={`₹${summary.premiumDue}`} color="bg-red-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Link to="/browse-plans" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition text-center">
                <p className="font-semibold text-blue-700">Browse Plans</p>
                <p className="text-xs text-gray-500 mt-1">Apply for a new policy</p>
              </Link>
              <Link to="/policies" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition text-center">
                <p className="font-semibold text-blue-700">My Policies</p>
                <p className="text-xs text-gray-500 mt-1">{summary.paymentHistoryCount} payments made</p>
              </Link>
              <Link to="/my-profile" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition text-center">
                <p className="font-semibold text-blue-700">My Profile</p>
                <p className="text-xs text-gray-500 mt-1">Update your details</p>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Claim Status</h2>
              {summary.claims.length === 0 && <p className="text-gray-500 text-sm">You haven't raised any claims yet.</p>}
              <ul className="space-y-2 text-sm">
                {summary.claims.map((c) => (
                  <li key={c.id} className="flex justify-between border-b pb-1">
                    <span>{c.policyNumber || "—"}: {c.reason}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      c.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      c.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{c.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`${color} text-white rounded-lg shadow p-5`}>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}