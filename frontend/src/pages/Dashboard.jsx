import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role === "ADMIN" || user.role === "AGENT") {
      api
        .get("/reports/dashboard")
        .then((res) => setStats(res.data))
        .catch((err) => setError(err.response?.data?.message || "Could not load report"));
    }
  }, [user]);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>

        {user.role === "CUSTOMER" && (
          <p className="text-gray-600">
            Use the menu above to view your policies, submit claims, and track payments.
          </p>
        )}

        {(user.role === "ADMIN" || user.role === "AGENT") && (
          <>
            {error && <p className="text-red-600">{error}</p>}
            {!stats && !error && <p>Loading stats...</p>}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card title="Active Policies" value={stats.activePolicies} color="bg-green-600" />
                <Card title="Expired/Cancelled" value={stats.expiredPolicies} color="bg-gray-600" />
                <Card title="Total Customers" value={stats.totalCustomers} color="bg-blue-600" />
                <Card
                  title="Premium Collected"
                  value={`₹${stats.totalPremiumCollected}`}
                  color="bg-purple-600"
                />
              </div>
            )}

            {stats && stats.claimStats?.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Claim Statistics</h2>
                <ul className="space-y-2">
                  {stats.claimStats.map((c) => (
                    <li key={c.status} className="flex justify-between border-b pb-1">
                      <span>{c.status}</span>
                      <span className="font-medium">{c._count.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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