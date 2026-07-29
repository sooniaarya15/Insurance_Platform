import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Login failed");
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
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Sign In</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border rounded px-3 py-2 pr-16"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="text-right mb-4">
          <Link to="/reset-password" className="text-sm text-blue-700 hover:underline">
            Forgot password? Reset it here
          </Link>
        </div>

        <button disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium disabled:opacity-60">
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-sm text-center mt-4">
          No account? <Link to="/register" className="text-blue-700 underline">Register</Link>
        </p>
      </form>
    </div>
  );
}