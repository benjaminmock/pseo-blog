"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ParticipantForm from "../../_components/ParticipantManager/ParticipantForm";

export default function NewParticipantPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/intern/participants");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/intern" className="hover:text-gray-700">
              Intern
            </Link>
            <span>›</span>
            <Link href="/intern/participants" className="hover:text-gray-700">
              Teilnehmer
            </Link>
            <span>›</span>
            <span className="text-gray-900">Neu</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Neuen Teilnehmer hinzufügen
          </h1>
          <p className="text-gray-600">
            Erfassen Sie die Daten eines neuen Teilnehmers
          </p>
        </div>

        {/* Participant Form */}
        <ParticipantForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
