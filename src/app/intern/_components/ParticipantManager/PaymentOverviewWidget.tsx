"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Payment {
  payment_id: number;
  participant_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  full_name: string;
  email: string;
  course_name: string | null;
  event_name: string | null;
}

interface PaymentStatsData {
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  totalPending: number;
  totalCompleted: number;
  totalFailed: number;
  totalPayments: number;
  totalAmount: number;
}

interface OutstandingEnrollment {
  enrollment_id: number;
  participant_id: number;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  full_name: string;
  email: string;
  course_name: string;
}

interface PaymentStatsResponse {
  stats: PaymentStatsData;
  recentPayments: Payment[];
  outstandingEnrollments: OutstandingEnrollment[];
}

export default function PaymentOverviewWidget() {
  const [statsData, setStatsData] = useState<PaymentStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      setLoading(true);

      // Fetch payment statistics from the new endpoint
      const response = await fetch("/api/payments/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch payment statistics");
      }

      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const colorClass =
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800";

    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}
      >
        {status === "pending"
          ? "Ausstehend"
          : status === "completed"
          ? "Abgeschlossen"
          : status === "failed"
          ? "Fehlgeschlagen"
          : status === "refunded"
          ? "Erstattet"
          : status === "cancelled"
          ? "Storniert"
          : status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Zahlungsübersicht
        </h3>
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Zahlungsübersicht
        </h3>
        <div className="text-red-600 text-sm">
          <p>Fehler beim Laden: {error}</p>
          <button
            onClick={fetchPaymentStats}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Zahlungsübersicht
        </h3>
        <p className="text-gray-600 text-sm">Keine Daten verfügbar</p>
      </div>
    );
  }

  const { stats, recentPayments, outstandingEnrollments } = statsData;

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Zahlungsübersicht</h3>
        <Link
          href="/intern/payments"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Alle anzeigen
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-yellow-800">
            {formatCurrency(stats.totalPending)}
          </div>
          <div className="text-xs text-yellow-600">
            {stats.pendingCount} ausstehend
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-800">
            {formatCurrency(stats.totalCompleted)}
          </div>
          <div className="text-xs text-green-600">
            {stats.completedCount} abgeschlossen
          </div>
        </div>
      </div>

      {/* Outstanding Enrollments Alert */}
      {outstandingEnrollments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Offene Beträge
              </h4>
              <p className="text-xs text-red-600">
                {outstandingEnrollments.length} Anmeldungen mit ausstehenden
                Zahlungen
              </p>
            </div>
            <div className="text-sm font-bold text-red-800">
              {formatCurrency(
                outstandingEnrollments.reduce(
                  (sum, e) => sum + e.outstanding_amount,
                  0
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      {recentPayments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm mb-2">
            Keine Zahlungen vorhanden
          </p>
          <Link
            href="/intern/payments"
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Zahlung erfassen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Letzte Zahlungen
          </h4>
          {recentPayments.slice(0, 5).map((payment) => (
            <div
              key={payment.payment_id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </span>
                  {getStatusBadge(payment.status)}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {payment.full_name} •{" "}
                  {payment.course_name || payment.event_name || "Allgemein"}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(payment.paid_at || payment.created_at)}
              </div>
            </div>
          ))}

          {recentPayments.length > 5 && (
            <div className="text-center pt-2">
              <Link
                href="/intern/payments"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Weitere Zahlungen anzeigen
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
