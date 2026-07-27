import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Policies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: "", policyType: "", policyNumber: "", premiumAmount: "", startDate: "", endDate: "",
  });
  const [error, setError] = useState("");
  const canManage = user.role === "ADMIN" || user.role === "AGENT";

  function loadPolicies() {
    api.get("/policies").then((res) => setPolicies(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadPolicies();
    if (canManage) {
      api.get("/customers").then((res) => setCustomers(res.data)).catch(() => {});
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/policies", form);
      setForm({ customerId: "", policyType: "", policyNumber: "", premiumAmount: "", startDate: "", endDate: "" });
      loadPolicies();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating policy");
    }
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
        <h1 className="text-2xl font-bold mb-6">Policies</h1>

        {canManage && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {error && <p className="text-red-600 sm:col-span-3 text-sm">{error}</p>}
            <select name="customerId" className="border rounded px-3 py-2" value={form.customerId} onChange={handleChange} required>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="policyType" placeholder="Policy type (e.g. Health, Life)" className="border rounded px-3 py-2" value={form.policyType} onChange={handleChange} required />
            <input name="policyNumber" placeholder="Policy number" className="border rounded px-3 py-2" value={form.policyNumber} onChange={handleChange} required />
            <input type="number" name="premiumAmount" placeholder="Premium amount" className="border rounded px-3 py-2" value={form.premiumAmount} onChange={handleChange} required />
            <input type="date" name="startDate" className="border rounded px-3 py-2" value={form.startDate} onChange={handleChange} required />
            <input type="date" name="endDate" className="border rounded px-3 py-2" value={form.endDate} onChange={handleChange} required />
            <button className="sm:col-span-3 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
              Create Policy
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Policy #</th>
                <th className="text-left px-4 py-2">Customer</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Premium</th>
                <th className="text-left px-4 py-2">Start</th>
                <th className="text-left px-4 py-2">End</th>
                <th className="text-left px-4 py-2">Status</th>
                {canManage && <th className="px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.policyNumber}</td>
                  <td className="px-4 py-2">{p.customer?.name}</td>
                  <td className="px-4 py-2">{p.policyType}</td>
                  <td className="px-4 py-2">₹{p.premiumAmount}</td>
                  <td className="px-4 py-2">{new Date(p.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(p.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-2 text-center space-x-2 whitespace-nowrap">
                      <button onClick={() => handleRenew(p.id)} className="text-blue-700 hover:underline">Renew</button>
                      <button onClick={() => handleCancel(p.id)} className="text-red-600 hover:underline">Cancel</button>
                    </td>
                  )}
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-gray-500">No policies yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}