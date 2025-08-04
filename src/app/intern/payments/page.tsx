"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PaymentList from "../_components/PaymentTracker/PaymentList";

type ViewMode = "list" | "form";

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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
            Zahlungen verwalten
          </h1>
          <p className="text-gray-600 mt-2">
            Übersicht und Verwaltung aller Zahlungen und Rechnungen
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={() => setViewMode("list")}
            className={`hover:text-gray-700 ${
              viewMode === "list" ? "text-gray-900 font-medium" : ""
            }`}
          >
            Zahlungen
          </button>
          {viewMode === "form" && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium">Neue Zahlung</span>
            </>
          )}
        </nav>
      </div>

      {/* Quick Actions */}
      {viewMode === "list" && (
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setViewMode("form")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Zahlung erfassen
          </button>
          <button
            onClick={() => {
              /* TODO: Implement bulk payment processing */
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sammelverarbeitung
          </button>
          <button
            onClick={() => {
              /* TODO: Implement export */
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Finanzreport
          </button>
          <button
            onClick={() => {
              /* TODO: Implement invoice generation */
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Rechnungen erstellen
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {viewMode === "list" && <PaymentList />}

        {viewMode === "form" && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Neue Zahlung erfassen
            </h2>
            <p className="text-gray-600">
              Formular für die Erfassung neuer Zahlungen wird hier
              implementiert.
            </p>
            <button
              onClick={() => setViewMode("list")}
              className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Zurück zur Liste
            </button>
          </div>
        )}
      </div>

      {/* Financial Overview (only show on list view) */}
      {viewMode === "list" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Gesamtumsatz
            </h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {/* TODO: Add real stats */}
              --
            </p>
            <p className="text-sm text-gray-600 mt-1">Diesen Monat</p>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Ausstehend
            </h3>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {/* TODO: Add real stats */}
              --
            </p>
            <p className="text-sm text-gray-600 mt-1">Offene Rechnungen</p>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Überfällig
            </h3>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {/* TODO: Add real stats */}
              --
            </p>
            <p className="text-sm text-gray-600 mt-1">Mehr als 30 Tage</p>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Erstattungen
            </h3>
            <p className="text-2xl font-bold text-gray-600 mt-2">
              {/* TODO: Add real stats */}
              --
            </p>
            <p className="text-sm text-gray-600 mt-1">Diesen Monat</p>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      {viewMode === "list" && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Zahlungsaktionen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                /* TODO: Navigate to overdue payments */
              }}
              className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
            >
              <h4 className="font-medium text-gray-900">
                Überfällige Zahlungen
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Mahnungen versenden und Zahlungserinnerungen
              </p>
            </button>

            <button
              onClick={() => {
                /* TODO: Navigate to refunds */
              }}
              className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
            >
              <h4 className="font-medium text-gray-900">Erstattungen</h4>
              <p className="text-sm text-gray-600 mt-1">
                Rückerstattungen verwalten und bearbeiten
              </p>
            </button>

            <button
              onClick={() => {
                /* TODO: Navigate to payment methods */
              }}
              className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
            >
              <h4 className="font-medium text-gray-900">Zahlungsarten</h4>
              <p className="text-sm text-gray-600 mt-1">
                Konfiguration von Zahlungsmethoden
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {viewMode === "list" && (
        <div className="mt-8 bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Letzte Aktivitäten
          </h3>
          <div className="space-y-3">
            {/* TODO: Add recent payment activities */}
            <p className="text-gray-500 text-center py-4">
              Keine aktuellen Aktivitäten
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
