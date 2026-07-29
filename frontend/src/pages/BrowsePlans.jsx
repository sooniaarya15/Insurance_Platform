import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function BrowsePlans() {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/policy-plans").then((res) => setPlans(res.data)).catch(() => {});
  }, []);

  async function handleApply(planId) {
    setError("");
    setMessage("");
    try {
      await api.post("/policies/apply", { planId });
      setMessage("Application submitted! You'll see it under 'My Policies' as Pending until Admin approves it.");
    } catch (err) {
      setError(err.response?.data?.message || "Error applying for policy");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Available Policy Plans</h1>

        {message && <p className="text-green-600 mb-4 text-sm">{message}</p>}
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

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
              <button
                onClick={() => handleApply(p.id)}
                className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded text-sm font-medium"
              >
                Apply for this Plan
              </button>
            </div>
          ))}
          {plans.length === 0 && <p className="text-gray-500">No plans available right now</p>}
        </div>
      </div>
    </div>
  );
}