import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const NAME_REGEX = /^[A-Za-z\s]*$/;

export default function StaffManagement() {
  const { createStaff } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "AGENT" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    try {
      const res = await createStaff(form.name, form.email, form.password, form.role);
      setSuccess(res.message);
      setForm({ name: "", email: "", password: "", role: "AGENT" });
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Agent / Admin</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              className={`w-full border rounded px-3 py-2 ${isNameInvalid ? "border-red-500" : ""}`}
              value={form.name}
              onChange={handleChange}
              required
            />
            {isNameInvalid && (
              <p className="text-red-600 text-xs mt-1">Invalid: numbers or symbols are not allowed in name</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
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
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select name="role" className="w-full border rounded px-3 py-2" value={form.role} onChange={handleChange}>
              <option value="AGENT">Insurance Agent</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
