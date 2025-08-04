"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ParticipantDetails from "../../_components/ParticipantManager/ParticipantDetails";

export default function ParticipantPage() {
  const params = useParams();
  const router = useRouter();
  const participantId = parseInt(params.participantId as string);

  if (isNaN(participantId)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-600 text-lg font-medium mb-4">
                Ungültige Teilnehmer-ID
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Zurück
                </button>
                <Link
                  href="/intern/participants"
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
                >
                  Zur Teilnehmerliste
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link href="/intern" className="hover:text-gray-700">
                  Intern
                </Link>
                <span>›</span>
                <Link
                  href="/intern/participants"
                  className="hover:text-gray-700"
                >
                  Teilnehmer
                </Link>
                <span>›</span>
                <span className="text-gray-900">Details</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">
                Teilnehmer Details
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zurück
              </button>
            </div>
          </div>
        </div>

        {/* Participant Details Component */}
        <ParticipantDetails participantId={participantId} />
      </div>
    </div>
  );
}
