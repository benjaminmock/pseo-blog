"use client";

import { useState, FormEvent } from "react";

interface WaitlistModalProps {
  slug: string;
  city: string;
  category: string;
}

export default function WaitListModal({
  slug,
  city,
  category,
}: WaitlistModalProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const handleModalToggle = () => {
    setModalOpen(!isModalOpen);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, city: slug }),
    });
    setModalOpen(false);
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-2xl mb-3">
          Warteliste für {category} in {city}
        </h3>
        <p className="text-gray-700 mb-2">
          Nicht der richtige Kurs oder das richtige Training für dich? Trete der
          Warteliste bei und werde benachrichtigt, wenn neue Trainings oder
          Kurse in {city} angeboten werden.
        </p>
        <div className="flex justify-end mt-4 mb-4">
          <button
            onClick={handleModalToggle}
            className="px-4 py-2 bg-rose-400 text-white rounded-md hover:bg-rose-600 transition-colors duration-200"
          >
            Zur Warteliste hinzufügen
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">
              Zur Warteliste hinzufügen
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Eintragen
              </button>
            </form>
            <button
              onClick={handleModalToggle}
              className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
