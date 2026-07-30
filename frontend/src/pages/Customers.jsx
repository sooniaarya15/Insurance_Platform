import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Customers() {
  const { user, createCustomerAccount, getAgents } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "", dob: "", agentId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isAdmin = user.role === "ADMIN";
  const isAgent = user.role === "AGENT";

  function loadCustomers() {
    api.get("/customers").then((res) => setCustomers(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadCustomers();
    if (isAdmin) {
      getAgents().then(setAgents).catch(() => {});
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createCustomerAccount(form);
      setSuccess("Customer account created — they can now log in with the email and password you set.");
      setForm({ name: "", email: "", password: "", phone: "", address: "", dob: "", agentId: "" });
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating customer");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    loadCustomers();
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">{isAdmin ? "All Customers" : "My Assigned Customers"}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {isAgent
            ? "Customers you create here are automatically assigned to you."
            : "Create a login-enabled customer account, and optionally assign an agent."}
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {error && <p className="text-red-600 col-span-2 text-sm">{error}</p>}
          {success && <p className="text-green-600 col-span-2 text-sm">{success}</p>}

          <input name="name" placeholder="Full name" className="border rounded px-3 py-2" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email (used to log in)" className="border rounded px-3 py-2" value={form.email} onChange={handleChange} required />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Set a login password"
              className="w-full border rounded px-3 py-2 pr-16"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input name="phone" placeholder="Phone" className="border rounded px-3 py-2" value={form.phone} onChange={handleChange} />
          <input type="date" name="dob" className="border rounded px-3 py-2" value={form.dob} onChange={handleChange} />
          <input name="address" placeholder="Address" className="border rounded px-3 py-2" value={form.address} onChange={handleChange} />

          {isAdmin && (
            <select name="agentId" className="border rounded px-3 py-2" value={form.agentId} onChange={handleChange}>
              <option value="">No agent assigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
              ))}
            </select>
          )}

          <button className="sm:col-span-2 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
            Create Customer Account
          </button>
        </form>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Phone</th>
                {isAdmin && <th className="text-left px-4 py-2">Agent</th>}
                {isAdmin && <th className="px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  {isAdmin && <td className="px-4 py-2">{c.agent?.name || "—"}</td>}
                  {isAdmin && (
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 3} className="px-4 py-4 text-center text-gray-500">No customers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}