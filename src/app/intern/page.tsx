"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function InternPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Show intern dashboard with navigation options
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">
        Interner Bereich
      </h1>
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2 text-gray-900">
            Willkommen, {session?.user?.name || session?.user?.email}!
          </h2>
          <p className="text-gray-600 mb-1">
            <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
              Rolle:{" "}
              {session?.user?.role === "teacher"
                ? "Lehrer*in/Trainer*in"
                : "Teilnehmer*in"}
            </span>
          </p>
        </div>

        {session?.user?.role === "teacher" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Verwaltung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/intern/kurse"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Kurse</h4>
                    <p className="text-sm text-gray-600">
                      Kurse verwalten und erstellen
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/intern/events"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Events
                    </h4>
                    <p className="text-sm text-gray-600">
                      Events verwalten und erstellen
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/intern/participants"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Teilnehmer
                    </h4>
                    <p className="text-sm text-gray-600">
                      Teilnehmer verwalten
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/intern/enrollments"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Anmeldungen
                    </h4>
                    <p className="text-sm text-gray-600">
                      Kursanmeldungen verwalten
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/intern/attendance"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Anwesenheit
                    </h4>
                    <p className="text-sm text-gray-600">Teilnahme erfassen</p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/intern/payments"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Zahlungen
                    </h4>
                    <p className="text-sm text-gray-600">
                      Rechnungen & Zahlungen
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Schnellzugriff
              </h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/anbieter-dashboard"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Teacher Dashboard
                </Link>
                <Link
                  href="/kurs/neu"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Neuen Kurs erstellen
                </Link>
                <Link
                  href="/event/neu"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Neues Event erstellen
                </Link>
              </div>
            </div>
          </div>
        )}

        {session?.user?.role === "student" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Meine Aktivitäten
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/student-dashboard"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Student Dashboard
              </Link>
              <Link
                href="/kurse"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kurse durchsuchen
              </Link>
              <Link
                href="/events"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Events durchsuchen
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
