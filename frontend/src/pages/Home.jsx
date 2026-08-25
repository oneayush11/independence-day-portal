import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ImageCarousel from "../components/ImageCarousel";
import api from "../api/axios";
import PortalGuideWidget from "../components/PortalGuideWidget";

export default function Home() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => {
        if (res.data.data && res.data.data.length > 0) {
          setAnnouncement(res.data.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fadeSlide">
            <p className="inline-block bg-saffron/10 text-saffron font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              🎉 15th August · Independence Day 2026
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-navy leading-tight">
              Celebrate the Spirit of <span className="text-saffron">Free</span>
              <span className="text-navy">dom</span>
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              Join us for flag hoisting, cultural programs, an exciting quiz competition, and a
              day full of patriotic celebration. Register now and be a part of the festivities!
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/register" className="btn-tricolor">
                <span>📝 Register Now</span>
              </Link>
              <Link to="/quiz" className="btn-outline">
                🏆 Take the Quiz
              </Link>
            </div>
          </div>

          <ImageCarousel />
        </div>
      </section>

      {announcement && (
        <div className="bg-saffron/10 border-y border-saffron/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <span className="text-xl">📢</span>
            <p className="text-sm text-navy">
              <span className="font-semibold">{announcement.title}:</span> {announcement.message}
            </p>
          </div>
        </div>
      )}

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-display font-bold text-3xl text-navy text-center mb-2">
          What's Happening
        </h2>
        <p className="text-center text-gray-500 mb-10">Everything you need for the big day</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "📅", title: "Event Schedule", desc: "Full day program from flag hoisting to prize distribution.", to: "/schedule" },
            { icon: "🎤", title: "Chief Guest", desc: "Meet our honoured speakers and chief guest for this year.", to: "/speakers" },
            { icon: "🏆", title: "Quiz Competition", desc: "Join the quiz and test your knowledge.", to: "/quiz" },
            { icon: "📸", title: "Photo Gallery", desc: "See the memories from our past celebrations.", to: "/gallery" },
          ].map((f) => (
            <Link
              to={f.to}
              key={f.title}
              className="card-hover bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="text-4xl mb-3 animate-float inline-block">{f.icon}</div>
              <h3 className="font-display font-semibold text-lg text-navy mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Patriotic quote strip */}
      <section className="bg-navy text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl sm:text-3xl font-display font-semibold leading-relaxed">
            Do or Die — Freedom is not our birthright, but our duty and our struggle.
          </p>
          <p className="mt-4 text-saffron font-medium">— Mahatma Gandhi</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-display font-bold text-3xl text-navy mb-3">
          Ready to Join the Celebration?
        </h2>
        <p className="text-gray-500 mb-8">
          Registration takes less than a minute. Certificates and prizes await our quiz winners!
        </p>
        <Link to="/register" className="btn-tricolor">
          <span>Register for the Event 🇮🇳</span>
        </Link>
      </section>

      <PortalGuideWidget />
    </div>
  );
}
