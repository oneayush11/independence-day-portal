import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // --- Forgot password (OTP flow) state ---
  // step: "email" -> "otp" -> "newPassword" -> "done"
  const [resetStep, setResetStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

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

  const switchMode = (next) => {
    setMode(next);
    setError("");
    if (next === "forgot") {
      setResetStep("email");
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setInfoMessage("");
    }
  };

  // Step 1: request an OTP for this email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: resetEmail });
      setInfoMessage(res.data.message);
      setResetStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the code the user typed
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email: resetEmail, otp });
      setResetStep("newPassword");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: set the new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: resetEmail, password: newPassword });
      setResetStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    email: "Forgot Password",
    otp: "Verify Code",
    newPassword: "Set New Password",
    done: "All Set!",
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="text-4xl">🇮🇳</span>
        <h1 className="font-display font-bold text-2xl text-navy mt-3">
          {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : stepTitles[resetStep]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {mode === "login"
            ? "Login to manage your participation"
            : mode === "signup"
            ? "Sign up to join the celebration"
            : resetStep === "email"
            ? "Enter your email and we'll send you a one-time code"
            : resetStep === "otp"
            ? `Enter the 6-digit code sent to ${resetEmail}`
            : resetStep === "newPassword"
            ? "Choose a new password for your account"
            : "Your password has been updated"}
        </p>
      </div>

      {mode !== "forgot" && (
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
      )}

      {/* --- FORGOT PASSWORD: 3-step OTP wizard --- */}
      {mode === "forgot" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {["email", "otp", "newPassword"].map((step, i) => (
              <React.Fragment key={step}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    resetStep === step || (resetStep === "done" && step === "newPassword")
                      ? "bg-saffron text-white"
                      : ["otp", "newPassword", "done"].indexOf(resetStep) > i
                      ? "bg-indiagreen text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>

          {resetStep === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-xs text-gray-400">
                This only works for regular participant accounts created via Sign Up — not for the
                admin account.
              </p>

              <div>
                <label className="text-sm font-medium text-navy">Email</label>
                <input
                  required
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="btn-tricolor w-full disabled:opacity-50">
                <span>{loading ? "Sending..." : "Send Code"}</span>
              </button>
            </form>
          )}

          {resetStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {infoMessage && (
                <div className="bg-indiagreen/10 border border-indiagreen/30 rounded-lg p-3 text-sm text-navy">
                  {infoMessage}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-navy">6-Digit Code</label>
                <input
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-center text-xl tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-saffron"
                  placeholder="------"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="btn-tricolor w-full disabled:opacity-50">
                <span>{loading ? "Verifying..." : "Verify Code"}</span>
              </button>

              <button
                type="button"
                onClick={() => setResetStep("email")}
                className="text-sm text-gray-500 hover:text-navy w-full text-center"
              >
                ← Use a different email
              </button>
            </form>
          )}

          {resetStep === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-navy">New Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy">Confirm New Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="btn-tricolor w-full disabled:opacity-50">
                <span>{loading ? "Updating..." : "Update Password"}</span>
              </button>
            </form>
          )}

          {resetStep === "done" && (
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-sm text-gray-600 mb-6">
                Your password has been updated. You can now log in with your new password.
              </p>

              <button onClick={() => switchMode("login")} className="btn-tricolor w-full">
                <span>Back to Login</span>
              </button>
            </div>
          )}

          {resetStep !== "done" && (
            <button
              onClick={() => switchMode("login")}
              className="text-sm text-gray-500 hover:text-navy w-full text-center mt-4"
            >
              ← Back to Login
            </button>
          )}
        </div>
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
