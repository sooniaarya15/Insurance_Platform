import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policyId: "", amount: "", paymentStatus: "PAID" });
  const [error, setError] = useState("");
  const isCustomer = user.role === "CUSTOMER";

  function loadPayments() {
    api.get("/payments").then((res) => setPayments(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadPayments();
    api.get("/policies").then((res) => setPolicies(res.data.filter((p) => p.status === "ACTIVE"))).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/payments", form);
      setForm({ policyId: "", amount: "", paymentStatus: "PAID" });
      loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || "Error recording payment");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{isCustomer ? "My Premium Payments" : "Premium Payments"}</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {error && <p className="text-red-600 sm:col-span-3 text-sm">{error}</p>}
          <select name="policyId" className="border rounded px-3 py-2" value={form.policyId} onChange={handleChange} required>
            <option value="">Select policy</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>{p.policyNumber} — {p.plan?.name}</option>
            ))}
          </select>
          <input type="number" name="amount" placeholder="Amount" className="border rounded px-3 py-2" value={form.amount} onChange={handleChange} required />
          {!isCustomer && (
            <select name="paymentStatus" className="border rounded px-3 py-2" value={form.paymentStatus} onChange={handleChange}>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          )}
          <button className="sm:col-span-3 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
            {isCustomer ? "Pay Premium" : "Record Payment"}
          </button>
        </form>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Policy #</th>
                {!isCustomer && <th className="text-left px-4 py-2">Customer</th>}
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.policy?.policyNumber}</td>
                  {!isCustomer && <td className="px-4 py-2">{p.policy?.customer?.name}</td>}
                  <td className="px-4 py-2">₹{p.amount}</td>
                  <td className="px-4 py-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{p.paymentStatus}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No payments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}