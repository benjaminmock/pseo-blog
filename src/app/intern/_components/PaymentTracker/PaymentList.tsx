"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Payment } from "@/lib/db/schema";

interface PaymentWithDetails extends Payment {
  participantName: string;
  participantEmail: string;
  courseName?: string;
  eventName?: string;
}

interface PaymentListProps {
  participantId?: number;
  courseId?: number;
  eventId?: number;
}

export default function PaymentList({
  participantId,
  courseId,
  eventId,
}: PaymentListProps) {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
  }, [participantId, courseId, eventId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = "/api/payments";
      const params = new URLSearchParams();

      if (participantId)
        params.append("participantId", participantId.toString());
      if (courseId) params.append("courseId", courseId.toString());
      if (eventId) params.append("eventId", eventId.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: number, status: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const statusMatch =
      statusFilter === "all" || payment.status === statusFilter;
    const methodMatch =
      methodFilter === "all" || payment.paymentMethod === methodFilter;
    return statusMatch && methodMatch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
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
        {status}
      </span>
    );
  };

  const getTotalStats = () => {
    const total = filteredPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const completed = filteredPayments
      .filter((p) => p.status === "completed")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending = filteredPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const refunded = filteredPayments
      .filter((p) => p.status === "refunded")
      .reduce(
        (sum, payment) => sum + (payment.refundAmount || payment.amount),
        0
      );

    return { total, completed, pending, refunded };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-red-600 text-center">
          <p>Fehler beim Laden der Zahlungen: {error}</p>
          <button
            onClick={fetchPayments}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Zahlungen ({filteredPayments.length})
        </h2>
        <Link
          href={`/intern/payments/new${
            participantId ? `?participantId=${participantId}` : ""
          }`}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neue Zahlung
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.total)}
          </div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-green-900">
            {formatCurrency(stats.completed)}
          </div>
          <div className="text-sm text-green-600">Abgeschlossen</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-yellow-900">
            {formatCurrency(stats.pending)}
          </div>
          <div className="text-sm text-yellow-600">Ausstehend</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.refunded)}
          </div>
          <div className="text-sm text-gray-600">Erstattet</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="completed">Abgeschlossen</option>
            <option value="failed">Fehlgeschlagen</option>
            <option value="refunded">Erstattet</option>
            <option value="cancelled">Storniert</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="method-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Zahlungsmethode
          </label>
          <select
            id="method-filter"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Alle Methoden</option>
            <option value="cash">Bargeld</option>
            <option value="transfer">Überweisung</option>
            <option value="card">Karte</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Zahlungen gefunden.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.paymentId}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                    {getStatusBadge(payment.status || "pending")}
                    {payment.paymentMethod && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {payment.paymentMethod}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      {!participantId && (
                        <>
                          <span className="font-medium">Teilnehmer:</span>{" "}
                          {payment.participantName}
                          <br />
                          <span className="font-medium">E-Mail:</span>{" "}
                          {payment.participantEmail}
                          <br />
                        </>
                      )}
                      {payment.courseName && (
                        <>
                          <span className="font-medium">Kurs:</span>{" "}
                          {payment.courseName}
                          <br />
                        </>
                      )}
                      {payment.eventName && (
                        <>
                          <span className="font-medium">Event:</span>{" "}
                          {payment.eventName}
                          <br />
                        </>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">Erstellt:</span>{" "}
                      {formatDate(payment.createdAt || "")}
                      <br />
                      {payment.paidAt && (
                        <>
                          <span className="font-medium">Bezahlt:</span>{" "}
                          {formatDate(payment.paidAt)}
                          <br />
                        </>
                      )}
                      {payment.transactionId && (
                        <>
                          <span className="font-medium">Transaktion:</span>{" "}
                          {payment.transactionId}
                          <br />
                        </>
                      )}
                    </div>
                  </div>

                  {payment.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Notizen:</span>{" "}
                      {payment.notes}
                    </div>
                  )}

                  {payment.refundAmount && payment.refundAmount > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      Erstattung: {formatCurrency(payment.refundAmount)}
                      {payment.refundedAt &&
                        ` am ${formatDate(payment.refundedAt)}`}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    href={`/intern/payments/${payment.paymentId}`}
                    className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-center"
                  >
                    Details
                  </Link>

                  {payment.status === "pending" && (
                    <button
                      onClick={() =>
                        updatePaymentStatus(payment.paymentId!, "completed")
                      }
                      className="px-3 py-1 text-sm border border-green-300 text-green-600 rounded hover:bg-green-50 transition-colors"
                    >
                      Als bezahlt markieren
                    </button>
                  )}

                  {payment.status === "completed" && (
                    <Link
                      href={`/intern/payments/${payment.paymentId}/refund`}
                      className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-center"
                    >
                      Erstatten
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
