import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot-password specific state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState(null);
  const [devResetUrl, setDevResetUrl] = useState(null);

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

  // Simple client-side format check (backend re-validates this too — this
  // is just for instant feedback before the network round-trip)
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setForgotMessage(null);
    setDevResetUrl(null);

    if (!isValidEmail(forgotEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMessage(res.data.message);
      // The backend only includes resetUrl when no email service is
      // configured yet (or sending failed) — see authController.js. Once
      // EMAIL_HOST/EMAIL_USER/EMAIL_PASS are set in backend/.env, this
      // won't be present and the user gets a real email instead.
      if (res.data.resetUrl) setDevResetUrl(res.data.resetUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setForgotMessage(null);
    setDevResetUrl(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🇮🇳</span>
        <h1 className="font-display font-bold text-2xl text-navy mt-3">
          {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {mode === "login"
            ? "Login to manage your participation"
            : mode === "signup"
            ? "Sign up to join the celebration"
            : "Enter your email and we'll help you reset it"}
        </p>
      </div>

      {mode !== "forgot" ? (
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
            {mode === "signup" && (
              <p className="text-xs text-gray-400 mt-1">
                Please use a Gmail, Yahoo, Outlook, iCloud, or other major email provider.
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-navy">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-saffron font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
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
      ) : (
        <form onSubmit={handleForgotSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
         
          <div>
            <label className="text-sm font-medium text-navy">Email</label>
            <input
              required
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {forgotMessage && (
            <div className="bg-indiagreen/10 border border-indiagreen/30 rounded-lg p-3 text-sm text-navy">
              {forgotMessage}
              {devResetUrl && (
                <>
                  <br />
                  <a href={devResetUrl} className="text-saffron font-semibold hover:underline break-all">
                    {devResetUrl}
                  </a>
              
                </>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-tricolor w-full disabled:opacity-50">
            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode("login")}
            className="text-sm text-gray-500 hover:text-navy w-full text-center"
          >
            ← Back to Login
          </button>
        </form>
      )}

      {mode !== "forgot" && (
        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="text-saffron font-semibold hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      )}
    </div>
  );
}
