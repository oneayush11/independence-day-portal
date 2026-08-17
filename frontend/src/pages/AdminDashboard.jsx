import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminOverview from "./admin/AdminOverview";
import AdminEvents from "./admin/AdminEvents";
import AdminRegistrations from "./admin/AdminRegistrations";
import AdminQuiz from "./admin/AdminQuiz";
import AdminResults from "./admin/AdminResults";
import AdminContent from "./admin/AdminContent";

const tabs = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "events", label: "Schedule", icon: "📅" },
  { key: "registrations", label: "Registrations", icon: "📝" },
  { key: "quiz", label: "AI Quiz Generator", icon: "🧠" },
  { key: "results", label: "Results & Certificates", icon: "🏅" },
  { key: "content", label: "Gallery / Announcements / Speakers", icon: "🗂️" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-saffron font-semibold">🔐 Admin Panel</p>
        <h1 className="font-display font-bold text-3xl text-navy mt-1">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage the entire Independence Day celebration from here.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              active === t.key
                ? "bg-navy text-white shadow-md"
                : "bg-white text-navy border border-gray-200 hover:border-saffron hover:text-saffron"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div>
        {active === "overview" && <AdminOverview />}
        {active === "events" && <AdminEvents />}
        {active === "registrations" && <AdminRegistrations />}
        {active === "quiz" && <AdminQuiz />}
        {active === "results" && <AdminResults />}
        {active === "content" && <AdminContent />}
      </div>
    </div>
  );
}
