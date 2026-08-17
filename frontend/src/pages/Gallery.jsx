import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    api
      .get("/gallery")
      .then((res) => {
        setItems(res.data.data || []);
        setFetchFailed(false);
      })
      .catch((err) => {
        console.error("Failed to load gallery:", err);
        setFetchFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-saffron font-semibold">📸 Memories</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1">Photo Gallery</h1>
      </div>

      {loading ? (
        <Loader label="Loading gallery..." />
      ) : fetchFailed ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center max-w-xl mx-auto">
          Couldn't load the gallery right now. Please refresh the page — if this keeps happening,
          check that the backend server is running.
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <div className="text-5xl mb-3">📷</div>
          <p>No photos yet. Check back soon!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card-hover break-inside-avoid rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <img src={item.imageUrl} alt={item.title || "Event photo"} className="w-full object-cover" />
              {(item.title || item.caption) && (
                <div className="p-3">
                  {item.title && <p className="font-semibold text-navy text-sm">{item.title}</p>}
                  {item.caption && <p className="text-xs text-gray-500">{item.caption}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
