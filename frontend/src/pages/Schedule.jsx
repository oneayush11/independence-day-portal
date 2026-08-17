import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-saffron font-semibold">📅 Full Day Program</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1">
          Event Schedule
        </h1>
      </div>

      {loading ? (
        <Loader label="Loading schedule..." />
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">Schedule will be updated soon. Please check back later.</p>
      ) : (
        <div className="relative border-l-4 border-saffron/40 ml-4">
          {events.map((event, i) => (
            <div key={event._id} className="mb-8 ml-8 relative animate-fadeSlide">
              <span className="absolute -left-[42px] flex items-center justify-center w-9 h-9 bg-white border-4 border-saffron rounded-full text-lg">
                {event.icon || "🎉"}
              </span>
              <div className="card-hover bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="font-display font-semibold text-lg text-navy">{event.title}</h3>
                  <span className="text-sm font-semibold text-indiagreen bg-indiagreen/10 px-3 py-1 rounded-full">
                    {event.time}
                  </span>
                </div>
                <p className="text-sm text-gray-500">📍 {event.venue}</p>
                {event.description && <p className="text-sm text-gray-600 mt-2">{event.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
