import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PolicyPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: "", category: "HEALTH", description: "", premiumAmount: "", coverageAmount: "", durationMonths: "12",
  });
  const [error, setError] = useState("");
  const isAdmin = user.role === "ADMIN";

  function loadPlans() {
    api.get("/policy-plans").then((res) => setPlans(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadPlans();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/policy-plans", form);
      setForm({ name: "", category: "HEALTH", description: "", premiumAmount: "", coverageAmount: "", durationMonths: "12" });
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating plan");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this plan?")) return;
    await api.delete(`/policy-plans/${id}`);
    loadPlans();
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Policy Plans</h1>

        {isAdmin && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {error && <p className="text-red-600 sm:col-span-3 text-sm">{error}</p>}
            <input name="name" placeholder="Plan name (e.g. Family Health Shield)" className="border rounded px-3 py-2" value={form.name} onChange={handleChange} required />
            <select name="category" className="border rounded px-3 py-2" value={form.category} onChange={handleChange}>
              <option value="HEALTH">Health</option>
              <option value="LIFE">Life</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="number" name="durationMonths" placeholder="Duration (months)" className="border rounded px-3 py-2" value={form.durationMonths} onChange={handleChange} />
            <input type="number" name="premiumAmount" placeholder="Premium amount" className="border rounded px-3 py-2" value={form.premiumAmount} onChange={handleChange} required />
            <input type="number" name="coverageAmount" placeholder="Coverage amount" className="border rounded px-3 py-2" value={form.coverageAmount} onChange={handleChange} required />
            <input name="description" placeholder="Short description" className="border rounded px-3 py-2 sm:col-span-3" value={form.description} onChange={handleChange} />
            <button className="sm:col-span-3 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
              Create Plan
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{p.category}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{p.description}</p>
              <div className="mt-3 text-sm space-y-1">
                <p>Premium: <span className="font-medium">₹{p.premiumAmount}</span></p>
                <p>Coverage: <span className="font-medium">₹{p.coverageAmount}</span></p>
                <p>Duration: <span className="font-medium">{p.durationMonths} months</span></p>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(p.id)} className="mt-3 text-red-600 text-sm hover:underline">
                  Delete
                </button>
              )}
            </div>
          ))}
          {plans.length === 0 && <p className="text-gray-500">No plans created yet</p>}
        </div>
      </div>
    </div>
  );
}