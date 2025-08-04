"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import EnrollmentForm from "../../_components/EnrollmentManager/EnrollmentForm";

export default function NewEnrollmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  const handleFormSuccess = () => {
    router.push("/intern/enrollments");
  };

  const handleFormCancel = () => {
    router.push("/intern/enrollments");
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Neue Anmeldung</h1>
          <p className="text-gray-600 mt-2">
            Neue Kursanmeldung für einen Teilnehmer erstellen
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={() => router.push("/intern/enrollments")}
            className="hover:text-gray-700"
          >
            Anmeldungen
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Neue Anmeldung</span>
        </nav>
      </div>

      <EnrollmentForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </main>
  );
}
