import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", dob: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/customers/me").then((res) => {
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        dob: res.data.dob ? res.data.dob.slice(0, 10) : "",
      });
    }).catch((err) => setError(err.response?.data?.message || "Could not load profile"));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/customers/me", form);
      setProfile((prev) => ({ ...prev, ...res.data }));
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

        {profile && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Email (cannot be changed)</label>
              <input className="w-full border rounded px-3 py-2 bg-gray-100" value={profile.email} disabled />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input name="name" className="w-full border rounded px-3 py-2" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" className="w-full border rounded px-3 py-2" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" name="dob" className="w-full border rounded px-3 py-2" value={form.dob} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input name="address" className="w-full border rounded px-3 py-2" value={form.address} onChange={handleChange} />
            </div>

            <button className="sm:col-span-2 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-medium">
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
}