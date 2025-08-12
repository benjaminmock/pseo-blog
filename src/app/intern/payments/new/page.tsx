"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import PaymentForm from "../../_components/PaymentTracker/PaymentForm";

function NewPaymentContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get optional parameters from URL
  const participantId = searchParams.get("participantId");
  const courseId = searchParams.get("courseId");
  const eventId = searchParams.get("eventId");
  const enrollmentId = searchParams.get("enrollmentId");
  const registrationId = searchParams.get("registrationId");

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  const handleFormSuccess = () => {
    router.push("/intern/payments");
  };

  const handleFormCancel = () => {
    router.push("/intern/payments");
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Neue Zahlung</h1>
          <p className="text-gray-600 mt-2">
            Neue Zahlung für einen Teilnehmer erfassen
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={() => router.push("/intern/payments")}
            className="hover:text-gray-700"
          >
            Zahlungen
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Neue Zahlung</span>
        </nav>
      </div>

      <PaymentForm
        participantId={participantId ? parseInt(participantId) : undefined}
        courseId={courseId ? parseInt(courseId) : undefined}
        eventId={eventId ? parseInt(eventId) : undefined}
        enrollmentId={enrollmentId ? parseInt(enrollmentId) : undefined}
        registrationId={registrationId ? parseInt(registrationId) : undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </main>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense
      fallback={<div className="max-w-6xl mx-auto p-6">Loading...</div>}
    >
      <NewPaymentContent />
    </Suspense>
  );
}
