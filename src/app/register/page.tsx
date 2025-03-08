"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.error || "Registrierung fehlgeschlagen");
      }
    } catch {
      setError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
          {/* <div className="text-6xl mt-4">😊</div> */}
          <div className="text-6xl mt-4">🧘‍♀️</div>
        </div>
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Registrieren
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-100 border border-red-300 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email Adresse</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Email Adresse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Passwort</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Passwort"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Passwort bestätigen
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Passwort bestätigen"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? "Wird registriert..." : "Registrieren"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            Oder{" "}
            <Link
              href="/login"
              className="font-medium text-slate-700 hover:text-slate-800"
            >
              melden Sie sich mit Ihrem bestehenden Konto an
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
