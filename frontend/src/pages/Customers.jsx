import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", dob: "" });
  const [error, setError] = useState("");
  const canManage = user.role === "ADMIN" || user.role === "AGENT";

  function loadCustomers() {
    api.get("/customers").then((res) => setCustomers(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/customers", form);
      setForm({ name: "", email: "", phone: "", address: "", dob: "" });
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
        <h1 className="text-2xl font-bold mb-6">Customers</h1>

        {canManage && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {error && <p className="text-red-600 col-span-2 text-sm">{error}</p>}
            <input name="name" placeholder="Full name" className="border rounded px-3 py-2" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className="border rounded px-3 py-2" value={form.email} onChange={handleChange} required />
            <input name="phone" placeholder="Phone" className="border rounded px-3 py-2" value={form.phone} onChange={handleChange} />
            <input type="date" name="dob" placeholder="Date of birth" className="border rounded px-3 py-2" value={form.dob} onChange={handleChange} />
            <input name="address" placeholder="Address" className="border rounded px-3 py-2 sm:col-span-2" value={form.address} onChange={handleChange} />
            <button className="sm:col-span-2 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
              Add Customer
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Address</th>
                {canManage && <th className="px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  <td className="px-4 py-2">{c.address}</td>
                  {canManage && (
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
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No customers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}