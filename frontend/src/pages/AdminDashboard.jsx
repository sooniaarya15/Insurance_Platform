import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load report"));
  }, []);

  function downloadReport() {
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/export/customers`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "customers-report.csv";
        link.click();
      });
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          {user.role === "ADMIN" && (
            <button
              onClick={downloadReport}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Download Customers Report (CSV)
            </button>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {!stats && !error && <p>Loading stats...</p>}

        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card title="Total Customers" value={stats.totalCustomers} color="bg-blue-600" />
              <Card title="Total Policies" value={stats.totalPolicies} color="bg-indigo-600" />
              <Card title="Active Policies" value={stats.activePolicies} color="bg-green-600" />
              <Card title="Expired Policies" value={stats.expiredPolicies} color="bg-gray-600" />
              <Card title="Pending Claims" value={stats.pendingClaims} color="bg-yellow-600" />
              <Card title="Approved Claims" value={stats.approvedClaims} color="bg-green-700" />
              <Card title="Rejected Claims" value={stats.rejectedClaims} color="bg-red-600" />
              <Card title="Revenue" value={`₹${stats.revenue}`} color="bg-purple-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Customers</h2>
                <ul className="space-y-2 text-sm">
                  {stats.recentCustomers.map((c) => (
                    <li key={c.id} className="flex justify-between border-b pb-1">
                      <span>{c.name}</span>
                      <span className="text-gray-500">{c.email}</span>
                    </li>
                  ))}
                  {stats.recentCustomers.length === 0 && <p className="text-gray-500">No customers yet</p>}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Policies</h2>
                <ul className="space-y-2 text-sm">
                  {stats.recentPolicies.map((p) => (
                    <li key={p.id} className="flex justify-between border-b pb-1">
                      <span>{p.plan?.name} — {p.customer?.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        p.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        p.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-200 text-gray-700"
                      }`}>{p.status}</span>
                    </li>
                  ))}
                  {stats.recentPolicies.length === 0 && <p className="text-gray-500">No policies yet</p>}
                </ul>
              </div>
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