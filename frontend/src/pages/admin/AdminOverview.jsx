import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading stats..." />;
  if (!stats) return <p className="text-gray-500">Could not load stats.</p>;

  const cards = [
    { label: "Registrations", value: stats.registrations, icon: "📝", color: "bg-saffron/10 text-saffron" },
    { label: "Registered Users", value: stats.registeredUsers, icon: "👥", color: "bg-indiagreen/10 text-indiagreen" },
    { label: "Quizzes Created", value: stats.quizzes, icon: "🧠", color: "bg-chakra/10 text-chakra" },
    { label: "Quiz Attempts", value: stats.quizAttempts, icon: "🏆", color: "bg-gold/10 text-yellow-600" },
    { label: "Gallery Photos", value: stats.galleryPhotos, icon: "📸", color: "bg-pink-100 text-pink-600" },
    { label: "Announcements", value: stats.announcements, icon: "📢", color: "bg-blue-100 text-blue-600" },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card-hover bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${c.color}`}>
              {c.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-display font-semibold text-lg text-navy mb-4">🏅 Top Quiz Scorers</h3>
        {stats.topScorers.length === 0 ? (
          <p className="text-sm text-gray-500">No quiz attempts yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.topScorers.map((r, i) => (
              <div key={r._id} className="flex items-center justify-between text-sm border-b border-gray-100 py-2">
                <span className="text-navy font-medium">
                  {i + 1}. {r.participantName}
                </span>
                <span className="text-gray-500">
                  {r.score}/{r.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
