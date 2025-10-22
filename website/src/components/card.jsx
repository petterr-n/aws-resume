import React, { useState } from "react";

export default function ExpandableCard({ title, icon, gradient, children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`cursor-pointer overflow-hidden transition-all duration-500 ease-in-out rounded-2xl shadow-md border ${gradient} ${
        expanded ? "p-6" : "p-4"
      } hover:shadow-xl`}
      style={{
        maxWidth: "650px",
        margin: "0 auto",
        minHeight: expanded ? "auto" : "90px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={icon} alt={title} className="w-10 h-10 bg-white/20 p-2 rounded-full" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>

        <span
          className={`text-white text-sm transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>

      {/* Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-gray-100 text-sm sm:text-base leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}
