"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import EnrollmentList from "../_components/EnrollmentManager/EnrollmentList";

interface EnrollmentStats {
  activeEnrollments: number;
  waitlistCount: number;
  outstandingPayments: number;
  cancellationsThisMonth: number;
}

export default function EnrollmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const handleNewEnrollment = () => {
    router.push("/intern/enrollments/new");
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/enrollments/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "teacher") {
      fetchStats();
    }
  }, [session, status]);

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">
            Anmeldungen verwalten
          </h1>
          <p className="text-gray-600 mt-2">
            Übersicht und Verwaltung aller Kursanmeldungen
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="text-gray-900 font-medium">Anmeldungen</span>
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleNewEnrollment}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neue Anmeldung
        </button>
        <button
          onClick={() => {
            /* TODO: Implement bulk enrollment */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Mehrfach-Anmeldung
        </button>
        <button
          onClick={() => {
            /* TODO: Implement export */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Liste exportieren
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <EnrollmentList />
      </div>

      {/* Statistics Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Aktive Anmeldungen
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.activeEnrollments ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Bestätigte Teilnahmen</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Warteliste
          </h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.waitlistCount ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Wartende Teilnehmer</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Ausstehende Zahlungen
          </h3>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.outstandingPayments ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Unbezahlte Anmeldungen</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Stornierungen
          </h3>
          <p className="text-2xl font-bold text-gray-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.cancellationsThisMonth ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Diesen Monat</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Verwandte Aktionen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleNewEnrollment}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Neue Anmeldung</h4>
            <p className="text-sm text-gray-600 mt-1">
              Neue Kursanmeldung für einen Teilnehmer erstellen
            </p>
          </button>

          <button
            onClick={() => router.push("/intern/payments")}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Zahlungen prüfen</h4>
            <p className="text-sm text-gray-600 mt-1">
              Zahlungsstatus und Rechnungen verwalten
            </p>
          </button>

          <button
            onClick={() => router.push("/intern/attendance")}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Anwesenheit erfassen</h4>
            <p className="text-sm text-gray-600 mt-1">
              Teilnahme an Kursstunden dokumentieren
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
