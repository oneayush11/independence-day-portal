import React from "react";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 border-4 border-saffron border-t-indiagreen rounded-full animate-spin" />
      <p className="text-navy/70 text-sm">{label}</p>
    </div>
  );
}
