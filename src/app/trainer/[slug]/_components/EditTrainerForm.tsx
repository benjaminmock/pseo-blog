"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Trainer = {
  trainer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  bio: string | null;
  link: string | null;
};

type EditTrainerFormProps = {
  trainer: Trainer;
};

export default function EditTrainerForm({ trainer }: EditTrainerFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: trainer.first_name,
    last_name: trainer.last_name,
    phone_number: trainer.phone_number || "",
    bio: trainer.bio || "",
    link: trainer.link || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/trainer/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainer_id: trainer.trainer_id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update trainer information");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {trainer.bio && (
          <div>
            <h2 className="text-xl font-medium mb-2">Über mich</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{trainer.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-medium mb-4">Kontakt</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-600">Email</dt>
                <dd className="font-medium">
                  <a
                    href={`mailto:${trainer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {trainer.email}
                  </a>
                </dd>
              </div>

              {trainer.phone_number && (
                <div>
                  <dt className="text-gray-600">Telefon</dt>
                  <dd className="font-medium">
                    <a
                      href={`tel:${trainer.phone_number}`}
                      className="text-blue-600 hover:underline"
                    >
                      {trainer.phone_number}
                    </a>
                  </dd>
                </div>
              )}

              {trainer.link && (
                <div>
                  <dt className="text-gray-600">Website</dt>
                  <dd className="font-medium">
                    <a
                      href={trainer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {trainer.link}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Profil bearbeiten
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-gray-700 mb-2">
            Vorname
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-gray-700 mb-2">
            Nachname
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-gray-700 mb-2">
          Telefon
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-gray-700 mb-2">
          Über mich
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="link" className="block text-gray-700 mb-2">
          Website
        </label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
