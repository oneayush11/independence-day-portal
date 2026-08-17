import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/schedule", label: "Schedule" },
  { to: "/speakers", label: "Speakers" },
  { to: "/quiz", label: "Quiz" },
  { to: "/register", label: "Register" },
  { to: "/gallery", label: "Gallery" },
  { to: "/announcements", label: "Announcements" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-navy text-white shadow-lg">
      <div className="h-1.5 w-full bg-gradient-to-r from-saffron via-white to-indiagreen" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg sm:text-xl">
            <span className="text-2xl animate-wave inline-block">🇮🇳</span>
            <span>
              Independence <span className="text-saffron">Day</span> Portal
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link text-sm ${isActive ? "text-saffron active" : "text-gray-200 hover:text-white"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-navy text-sm !py-2 !px-4">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-gray-300">Hi, {user.name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="btn-danger text-sm">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-tricolor text-sm !py-2 !px-5">
                <span>Login</span>
              </Link>
            )}
          </div>

          <button
            className="lg:hidden text-2xl"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-navy border-t border-white/10 px-4 pb-4 animate-fadeSlide">
          <nav className="flex flex-col gap-3 pt-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-1 ${isActive ? "text-saffron font-semibold" : "text-gray-200"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-saffron font-semibold">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-danger text-sm w-fit mt-1">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-tricolor text-sm w-fit !py-2 !px-5">
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
