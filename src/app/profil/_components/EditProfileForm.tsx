"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Trainer, File } from "@prisma/client";
import AvatarUpload from "./AvatarUpload";
import Image from "next/image";

type TrainerWithAvatar = Trainer & {
  avatarFile?: File | null;
};

type EditProfileFormProps = {
  user: User | null;
  trainer: TrainerWithAvatar | null;
};

export default function EditProfileForm({
  user,
  trainer,
}: EditProfileFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    trainer?.avatarFile?.url || null
  );
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    first_name: trainer?.firstName || "",
    last_name: trainer?.lastName || "",
    phone_number: trainer?.phoneNumber || "",
    bio: trainer?.bio || "",
    link: trainer?.link || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          trainer_id: trainer?.trainerId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update profile information");
      }

      setSuccess("Profil erfolgreich aktualisiert!");
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

  const handleAvatarUploadComplete = (avatarUrl: string) => {
    setCurrentAvatarUrl(avatarUrl);
    setSuccess("Avatar erfolgreich hochgeladen!");
    router.refresh();
  };

  const handleAvatarUploadError = (errorMessage: string) => {
    setError(`Avatar Upload Fehler: ${errorMessage}`);
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>
        )}

        {/* Avatar Section */}
        {trainer && (
          <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {currentAvatarUrl ? (
                <Image
                  src={currentAvatarUrl}
                  alt="Trainer Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-3xl">👤</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-medium text-gray-900">
                {trainer.firstName} {trainer.lastName}
              </h2>
              <p className="text-gray-600">{trainer.email}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-medium mb-4">
              Persönliche Informationen
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-600">Name</dt>
                <dd className="font-medium">
                  {user?.name || "Nicht angegeben"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Email</dt>
                <dd className="font-medium">
                  <a
                    href={`mailto:${user?.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user?.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Rolle</dt>
                <dd className="font-medium capitalize">
                  {user?.role || "student"}
                </dd>
              </div>
            </dl>
          </div>

          {trainer && (
            <div>
              <h2 className="text-xl font-medium mb-4">
                Trainer Informationen
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-gray-600">Vorname</dt>
                  <dd className="font-medium">
                    {trainer.firstName || "Nicht angegeben"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600">Nachname</dt>
                  <dd className="font-medium">
                    {trainer.lastName || "Nicht angegeben"}
                  </dd>
                </div>
                {trainer.phoneNumber && (
                  <div>
                    <dt className="text-gray-600">Telefon</dt>
                    <dd className="font-medium">
                      <a
                        href={`tel:${trainer.phoneNumber}`}
                        className="text-blue-600 hover:underline"
                      >
                        {trainer.phoneNumber}
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
          )}
        </div>

        {trainer?.bio && (
          <div>
            <h2 className="text-xl font-medium mb-2">Über mich</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{trainer.bio}</p>
          </div>
        )}

        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 px-4 py-2 text-white rounded-lg transition-colors bg-black text-white rounded-lg hover:bg-gray-900"
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

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>
      )}

      {/* Avatar Upload Section */}
      {trainer && (
        <div>
          <h2 className="text-xl font-medium mb-4">Profilbild</h2>
          <AvatarUpload
            currentAvatarUrl={currentAvatarUrl}
            trainerId={trainer.trainerId}
            onUploadComplete={handleAvatarUploadComplete}
            onUploadError={handleAvatarUploadError}
          />
        </div>
      )}

      <div style={{ display: "none" }}>
        <h2 className="text-xl font-medium mb-4">Persönliche Informationen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={true} // Email should not be editable as it's used for authentication
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email kann nicht geändert werden
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Trainer Informationen</h2>
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
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
          className="px-4 py-2 text-white rounded-lg transition-colors bg-black text-white rounded-lg hover:bg-gray-900"
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
