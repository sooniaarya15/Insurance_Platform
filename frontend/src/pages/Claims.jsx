import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Claims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policyId: "", claimAmount: "", reason: "" });
  const [error, setError] = useState("");
  const canReview = user.role === "ADMIN" || user.role === "AGENT";

  function loadClaims() {
    api.get("/claims").then((res) => setClaims(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadClaims();
    api.get("/policies").then((res) => setPolicies(res.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/claims", form);
      setForm({ policyId: "", claimAmount: "", reason: "" });
      loadClaims();
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting claim");
    }
  }

  async function handleStatus(id, status) {
    await api.put(`/claims/${id}/status`, { status });
    loadClaims();
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Claims</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {error && <p className="text-red-600 sm:col-span-3 text-sm">{error}</p>}
          <select name="policyId" className="border rounded px-3 py-2" value={form.policyId} onChange={handleChange} required>
            <option value="">Select policy</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>{p.policyNumber} — {p.customer?.name}</option>
            ))}
          </select>
          <input type="number" name="claimAmount" placeholder="Claim amount" className="border rounded px-3 py-2" value={form.claimAmount} onChange={handleChange} required />
          <input name="reason" placeholder="Reason for claim" className="border rounded px-3 py-2" value={form.reason} onChange={handleChange} required />
          <button className="sm:col-span-3 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
            Submit Claim
          </button>
        </form>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Policy #</th>
                <th className="text-left px-4 py-2">Customer</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Reason</th>
                <th className="text-left px-4 py-2">Status</th>
                {canReview && <th className="px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.policy?.policyNumber}</td>
                  <td className="px-4 py-2">{c.policy?.customer?.name}</td>
                  <td className="px-4 py-2">₹{c.claimAmount}</td>
                  <td className="px-4 py-2">{c.reason}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      c.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      c.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  {canReview && (
                    <td className="px-4 py-2 text-center space-x-2 whitespace-nowrap">
                      <button onClick={() => handleStatus(c.id, "APPROVED")} className="text-green-700 hover:underline">Approve</button>
                      <button onClick={() => handleStatus(c.id, "REJECTED")} className="text-red-600 hover:underline">Reject</button>
                    </td>
                  )}
                </tr>
              ))}
              {claims.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No claims yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}