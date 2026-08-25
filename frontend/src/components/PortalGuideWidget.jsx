import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Update this if you need a different country code — currently set to
// India (+91) followed by the number.
const WHATSAPP_NUMBER = "918235002088";

const TOPICS = [
  {
    key: "schedule",
    label: "📅 Event Schedule",
    path: "/schedule",
    summary:
      "See the full day's program — flag hoisting, national anthem, chief guest address, cultural shows, quiz timing, and prize distribution, all in one timeline.",
  },
  {
    key: "speakers",
    label: "🎤 Speakers",
    path: "/speakers",
    summary:
      "Meet this year's Chief Guest and other speakers joining the celebration, with a short bio for each.",
  },
  {
    key: "quiz",
    label: "🏆 Quiz Competition",
    path: "/quiz",
    summary:
      "Log in, pick an active quiz, and test your knowledge of India's freedom struggle. Finish it to get an instant downloadable certificate.",
  },
  {
    key: "register",
    label: "📝 Registration",
    path: "/register",
    summary:
      "A quick form to reserve your spot for the event — just your name, email, phone, and what you're interested in.",
  },
  {
    key: "gallery",
    label: "📸 Gallery",
    path: "/gallery",
    summary: "Browse photos from this year's (and past) Independence Day celebrations.",
  },
  {
    key: "announcements",
    label: "📢 Announcements",
    path: "/announcements",
    summary: "The latest updates and important notices from the organizers, newest first.",
  },
  {
    key: "admin",
    label: "🔐 Admin Panel",
    path: "/admin",
    summary:
      "For organizers only (login required) — manage the schedule, quizzes, registrations, gallery, and announcements from one dashboard.",
  },
];

// A small, fully self-contained "ask about this site" widget for the
// homepage. It's not calling any AI API — it's a lightweight guided picker
// so visitors instantly get a short summary of any page (with a direct
// link to jump there), plus a one-tap way to message the organizer on
// WhatsApp.
export default function PortalGuideWidget() {
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [pulse, setPulse] = useState(true); // subtle hint on the button until first opened

  // Close on Escape, like the admin Modal does elsewhere in the app
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const selected = TOPICS.find((t) => t.key === activeTopic);

  const openWhatsApp = () => {
    const message = selected
      ? `Hi! I had a question about the "${selected.label.replace(/^\S+\s/, "")}" section of the Independence Day Portal.`
      : "Hi! I had a question about the Independence Day Portal.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const closeAndReset = () => {
    setOpen(false);
    setActiveTopic(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 max-w-[85vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeSlide">
          <div className="bg-navy text-white px-4 py-3 flex items-center justify-between">
            <p className="font-display font-semibold text-sm flex items-center gap-2">
              🇮🇳 Portal Guide
            </p>
            <button onClick={closeAndReset} className="text-white/70 hover:text-white text-lg leading-none" aria-label="Close">
              ✕
            </button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {!selected ? (
              <>
                <p className="text-sm text-gray-500 mb-3">Which page would you like to know about?</p>
                <div className="flex flex-col gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTopic(t.key)}
                      className="text-left text-sm px-3 py-2.5 rounded-lg border border-gray-200 hover:border-saffron hover:bg-saffron/5 transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTopic(null)}
                  className="text-xs text-saffron font-semibold mb-3"
                >
                  ← Back to topics
                </button>
                <p className="font-semibold text-navy mb-1">{selected.label}</p>
                <p className="text-sm text-gray-600 mb-4">{selected.summary}</p>
                <Link
                  to={selected.path}
                  onClick={closeAndReset}
                  className="btn-outline w-full text-sm justify-center mb-2"
                >
                  Go to this page →
                </Link>
              </>
            )}

            <button onClick={openWhatsApp} className="btn-tricolor w-full text-sm mt-2">
              <span>💬 Connect on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setPulse(false);
          setOpen((o) => !o);
        }}
        aria-label="Open portal guide"
        className="relative w-14 h-14 rounded-full bg-navy text-white text-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        {pulse && !open && (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron rounded-full" />
          </>
        )}
        {open ? "✕" : "🤖"}
      </button>
    </div>
  );
}
