import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, newPassword);
      setSuccess(res.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Something went wrong");
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
        <h1 className="text-2xl font-bold mb-2 text-center text-blue-700">Forgot / Reset Password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your registered email and choose a new password.
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <label className="block text-sm font-medium mb-1">Registered Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm font-medium mb-1">New Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border rounded px-3 py-2 pr-16"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <input
          type={showPassword ? "text" : "password"}
          className="w-full border rounded px-3 py-2 mb-6"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />

        <button disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium disabled:opacity-60">
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="text-sm text-center mt-4">
          <Link to="/login" className="text-blue-700 underline">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}