import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAME_REGEX = /^[A-Za-z\s]*$/;

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isNameInvalid = form.name.length > 0 && !NAME_REGEX.test(form.name);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!NAME_REGEX.test(form.name) || form.name.trim().length === 0) {
      setError("Name should contain only letters (no numbers or special characters)");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Registration failed");
      } else if (err.request) {
        setError("Could not reach the server. Please make sure the backend is running.");
      } else {
        setError("Something went wrong: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Create Account</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          name="name"
          className={`w-full border rounded px-3 py-2 mb-1 ${isNameInvalid ? "border-red-500" : ""}`}
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Rahul Sharma"
          required
        />
        {isNameInvalid && (
          <p className="text-red-600 text-xs mb-3">Invalid: numbers or symbols are not allowed in name</p>
        )}
        {!isNameInvalid && <div className="mb-4" />}

        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" name="email" className="w-full border rounded px-3 py-2 mb-4" value={form.email} onChange={handleChange} required />

        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-1">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="w-full border rounded px-3 py-2 pr-16"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Minimum 6 characters</p>

        <label className="block text-sm font-medium mb-1">Role</label>
        <select name="role" className="w-full border rounded px-3 py-2 mb-6" value={form.role} onChange={handleChange}>
          <option value="CUSTOMER">Customer</option>
          <option value="AGENT">Insurance Agent</option>
          <option value="ADMIN">Administrator</option>
        </select>

        <button disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium disabled:opacity-60">
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-700 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}