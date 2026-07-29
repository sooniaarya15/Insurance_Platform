import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Policies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const isAdmin = user.role === "ADMIN";
  const isAgent = user.role === "AGENT";

  function loadPolicies() {
    api.get("/policies").then((res) => setPolicies(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadPolicies();
  }, []);

  async function handleStatus(id, status) {
    await api.put(`/policies/${id}/status`, { status });
    loadPolicies();
  }

  async function handleRenew(id) {
    await api.put(`/policies/${id}/renew`);
    loadPolicies();
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this policy?")) return;
    await api.put(`/policies/${id}/cancel`);
    loadPolicies();
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{isAdmin || isAgent ? "All Policies" : "My Policies"}</h1>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Policy #</th>
                {(isAdmin || isAgent) && <th className="text-left px-4 py-2">Customer</th>}
                <th className="text-left px-4 py-2">Plan</th>
                <th className="text-left px-4 py-2">Premium</th>
                <th className="text-left px-4 py-2">Start</th>
                <th className="text-left px-4 py-2">End</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.policyNumber || "—"}</td>
                  {(isAdmin || isAgent) && <td className="px-4 py-2">{p.customer?.name}</td>}
                  <td className="px-4 py-2">{p.plan?.name}</td>
                  <td className="px-4 py-2">₹{p.premiumAmount}</td>
                  <td className="px-4 py-2">{p.startDate ? new Date(p.startDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2">{p.endDate ? new Date(p.endDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      p.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      p.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-200 text-gray-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2 whitespace-nowrap">
                    {isAdmin && p.status === "PENDING" && (
                      <>
                        <button onClick={() => handleStatus(p.id, "ACTIVE")} className="text-green-700 hover:underline">Approve</button>
                        <button onClick={() => handleStatus(p.id, "REJECTED")} className="text-red-600 hover:underline">Reject</button>
                      </>
                    )}
                    {(isAdmin || isAgent) && p.status === "ACTIVE" && (
                      <>
                        <button onClick={() => handleRenew(p.id)} className="text-blue-700 hover:underline">Renew</button>
                        <button onClick={() => handleCancel(p.id)} className="text-red-600 hover:underline">Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-gray-500">No policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}