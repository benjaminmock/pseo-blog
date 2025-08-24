"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ParticipantForm from "../../../_components/ParticipantManager/ParticipantForm";
import { Participant } from "@prisma/client";

export default function EditParticipantPage() {
  const params = useParams();
  const router = useRouter();
  const participantId = parseInt(params.participantId as string);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipant = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/participants/${participantId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Teilnehmer nicht gefunden");
        } else {
          throw new Error("Failed to fetch participant");
        }
        return;
      }

      const data = await response.json();
      setParticipant(data.participant);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    if (participantId && !isNaN(participantId)) {
      fetchParticipant();
    }
  }, [participantId, fetchParticipant]);

  const handleSuccess = () => {
    router.push(`/intern/participants/${participantId}`);
  };

  const handleCancel = () => {
    router.back();
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-600 text-lg font-medium mb-4">
                {error}
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

  if (!participant) {
    return null;
  }

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
            <Link
              href={`/intern/participants/${participantId}`}
              className="hover:text-gray-700"
            >
              {participant.fullName}
            </Link>
            <span>›</span>
            <span className="text-gray-900">Bearbeiten</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Teilnehmer bearbeiten
          </h1>
          <p className="text-gray-600">{participant.fullName}</p>
        </div>

        {/* Participant Form */}
        <ParticipantForm
          participant={participant}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
