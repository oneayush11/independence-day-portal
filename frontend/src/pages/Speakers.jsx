import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/events/speakers/all")
      .then((res) => setSpeakers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-saffron font-semibold">🎤 Guests of Honour</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1">
          Chief Guest & Speakers
        </h1>
      </div>

      {loading ? (
        <Loader label="Loading speakers..." />
      ) : speakers.length === 0 ? (
        <p className="text-center text-gray-500">
          Speaker details will be announced soon. Stay tuned!
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((s) => (
            <div key={s._id} className="card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-navy to-chakra flex items-center justify-center text-6xl">
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  "🎙️"
                )}
              </div>
              <div className="p-5">
                {s.isChiefGuest && (
                  <span className="inline-block text-xs font-semibold text-saffron bg-saffron/10 px-3 py-1 rounded-full mb-2">
                    Chief Guest
                  </span>
                )}
                <h3 className="font-display font-semibold text-lg text-navy">{s.name}</h3>
                <p className="text-sm text-gray-500">
                  {s.designation}
                  {s.organization ? `, ${s.organization}` : ""}
                </p>
                {s.bio && <p className="text-sm text-gray-600 mt-2">{s.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
