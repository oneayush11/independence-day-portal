import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password, phone: form.phone };
      const res = await api.post(endpoint, payload);
      login(res.data.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🇮🇳</span>
        <h1 className="font-display font-bold text-2xl text-navy mt-3">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {mode === "login" ? "Login to manage your participation" : "Sign up to join the celebration"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium text-navy">Full Name</label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-navy">Email</label>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Password</label>
          <input
            required
            type="password"
            name="password"
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>
        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium text-navy">Phone (optional)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-tricolor w-full disabled:opacity-50">
          <span>{loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}</span>
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="text-saffron font-semibold hover:underline"
        >
          {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </p>

      {mode === "login" && (
        <p className="text-center text-xs text-gray-400 mt-4">
          {" "}
          
        </p>
      )}
    </div>
  );
}
