import React, { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    category: "Student",
    eventInterest: "General Celebration",
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });
    try {
      await api.post("/registrations", form);
      setStatus({ loading: false, success: true, error: "" });
      setForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
        category: "Student",
        eventInterest: "General Celebration",
      });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || "Registration failed" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-saffron font-semibold">📝 Join Us</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1">
          Event Registration
        </h1>
        <p className="text-gray-500 mt-2">Fill in your details to reserve your spot</p>
      </div>

      {status.success ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fadeSlide">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="font-display font-semibold text-xl text-navy mb-1">Registration Successful!</h2>
          <p className="text-gray-600 text-sm">We look forward to celebrating with you on 15th August.</p>
          <button onClick={() => setStatus({ loading: false, success: false, error: "" })} className="btn-outline mt-6">
            Register Another Participant
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4 animate-fadeSlide">
          <div>
            <label className="text-sm font-medium text-navy">Full Name *</label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-navy">Email *</label>
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
              <label className="text-sm font-medium text-navy">Phone *</label>
              <input
                required
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-navy">Organization / School / College</label>
            <input
              name="organization"
              value={form.organization}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-navy">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              >
                <option>Student</option>
                <option>Employee</option>
                <option>Guest</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Interested In</label>
              <select
                name="eventInterest"
                value={form.eventInterest}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              >
                <option>General Celebration</option>
                <option>Quiz Competition</option>
                <option>Cultural Programs</option>
                <option>Volunteering</option>
              </select>
            </div>
          </div>

          {status.error && <p className="text-red-600 text-sm">{status.error}</p>}

          <button type="submit" disabled={status.loading} className="btn-tricolor w-full disabled:opacity-50">
            <span>{status.loading ? "Submitting..." : "Submit Registration 🇮🇳"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
