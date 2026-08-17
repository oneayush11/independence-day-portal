import React from "react";

export default function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-navy break-words">{value}</span>
    </div>
  );
}
