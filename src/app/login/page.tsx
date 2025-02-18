"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        router.push("/"); // Redirect to home page after successful login
        router.refresh(); // Refresh the page to update navigation state
      } else {
        const data = await response.json();
        setError(data.error || "Login fehlgeschlagen");
      }
    } catch (err) {
      setError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Willkommen zurück!
          </h2>
          <div className="text-6xl mt-4">🧘‍♀️</div>
        </div>
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Anmelden</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-100 border border-red-300 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email Adresse
              </label>
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
              <label className="block text-sm font-medium text-gray-600">
                Passwort
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 text-gray-600"
                placeholder="Passwort"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            Oder{" "}
            <Link
              href="/register"
              className="font-medium text-slate-700 hover:text-slate-500"
            >
              registrieren Sie sich für ein neues Konto
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
