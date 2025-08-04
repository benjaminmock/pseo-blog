"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import ParticipantList from "../_components/ParticipantManager/ParticipantList";
import ActiveCoursesWidget from "../_components/ParticipantManager/ActiveCoursesWidget";
import PaymentOverviewWidget from "../_components/ParticipantManager/PaymentOverviewWidget";

export default function ParticipantsPage() {
  const { data: session, status } = useSession();

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
            Teilnehmer-Verwaltung
          </h1>
          <p className="text-gray-600 mt-2">
            Verwalten Sie Ihre Kursteilnehmer und deren Anmeldungen
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/intern" className="hover:text-gray-700">
            Intern
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Teilnehmer</span>
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Link
          href="/intern/participants/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neuen Teilnehmer hinzufügen
        </Link>
        <button
          onClick={() => {
            /* TODO: Implement bulk import */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          CSV Import
        </button>
        <button
          onClick={() => {
            /* TODO: Implement export */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Exportieren
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <ParticipantList />
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Schnellzugriff
          </h3>
          <div className="space-y-2">
            <Link
              href="/intern/enrollments"
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              Alle Anmeldungen anzeigen
            </Link>
            <Link
              href="/intern/payments"
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              Zahlungen verwalten
            </Link>
            <Link
              href="/intern/attendance"
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
            >
              Anwesenheit erfassen
            </Link>
          </div>
        </div>

        <ActiveCoursesWidget />

        <PaymentOverviewWidget />
      </div>
    </main>
  );
}
