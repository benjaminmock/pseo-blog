"use client";

import { useState } from "react";

type FilterOption = {
  label: string;
  options: string[];
};

const filterOptions: Record<string, FilterOption> = {
  level: {
    label: "Level",
    options: ["Anfänger", "Mittelstufe", "Fortgeschritten", "Alle Level"],
  },
  type: {
    label: "Kurstyp",
    options: ["Hatha", "Vinyasa", "Yin", "Ashtanga", "Kundalini"],
  },
  duration: {
    label: "Dauer",
    options: ["30 Min", "45 Min", "60 Min", "90 Min"],
  },
  format: {
    label: "Format",
    options: ["Vor Ort", "Online", "Hybrid"],
  },
};

export default function SearchSection() {
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section data-testid="search-section" className="container mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Gib deinen Standort ein"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Kurse suchen
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            className="mt-4 text-purple-600 font-medium flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {showFilters ? "Filter ausblenden" : "Filter anzeigen"}
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(filterOptions).map(
                ([key, { label, options }]) => (
                  <div key={key} className="space-y-2">
                    <label className="font-medium text-gray-700">{label}</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Alle {label}</option>
                      {options.map((option) => (
                        <option key={option} value={option.toLowerCase()}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
