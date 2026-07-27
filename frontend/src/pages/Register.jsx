import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password, form.role);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Create Account</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input name="name" className="w-full border rounded px-3 py-2 mb-4" value={form.name} onChange={handleChange} required />

        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" name="email" className="w-full border rounded px-3 py-2 mb-4" value={form.email} onChange={handleChange} required />

        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" name="password" className="w-full border rounded px-3 py-2 mb-4" value={form.password} onChange={handleChange} required />

        <label className="block text-sm font-medium mb-1">Role</label>
        <select name="role" className="w-full border rounded px-3 py-2 mb-6" value={form.role} onChange={handleChange}>
          <option value="CUSTOMER">Customer</option>
          <option value="AGENT">Insurance Agent</option>
          <option value="ADMIN">Administrator</option>
        </select>

        <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
          Register
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-700 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}