import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-saffron font-semibold">📢 Stay Updated</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1">Announcements</h1>
      </div>

      {loading ? (
        <Loader label="Loading announcements..." />
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500">No announcements yet. Check back soon!</p>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <div
              key={a._id}
              className={`card-hover rounded-2xl p-6 border ${
                a.priority === "high" ? "bg-saffron/5 border-saffron/40" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-lg text-navy">{a.title}</h3>
                {a.priority === "high" && (
                  <span className="text-xs font-semibold text-white bg-saffron px-3 py-1 rounded-full">
                    Important
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{a.message}</p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
