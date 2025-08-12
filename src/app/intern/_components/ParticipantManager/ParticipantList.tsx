"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Participant } from "@/lib/db/schema";

interface ParticipantWithStats extends Participant {
  enrollmentCount: number;
  eventCount: number;
  totalPaid: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ParticipantList() {
  const [participants, setParticipants] = useState<ParticipantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"full_name" | "email" | "created_at">(
    "full_name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchParticipants = useCallback(
    async (page?: number, limit?: number) => {
      try {
        // Only show full loading on initial load, use searchLoading for subsequent searches
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setSearchLoading(true);
        }

        const currentPage = page ?? pagination.page;
        const currentLimit = limit ?? pagination.limit;

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: currentLimit.toString(),
          sortBy,
          sortOrder,
        });

        if (debouncedSearchTerm) {
          params.append("search", debouncedSearchTerm);
        }

        const response = await fetch(`/api/participants?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch participants");
        }
        const data = await response.json();
        setParticipants(data.participants || []);
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
        }));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
          setIsInitialLoad(false);
        } else {
          setSearchLoading(false);
        }
      }
    },
    [
      debouncedSearchTerm,
      sortBy,
      sortOrder,
      isInitialLoad,
      pagination.page,
      pagination.limit,
    ]
  );

  // Fetch participants when search term, sort, or pagination changes
  useEffect(() => {
    fetchParticipants();
  }, [debouncedSearchTerm, sortBy, sortOrder, fetchParticipants]);

  // Handle pagination changes separately to avoid circular dependencies
  useEffect(() => {
    if (!isInitialLoad) {
      fetchParticipants();
    }
  }, [pagination.page, pagination.limit, fetchParticipants, isInitialLoad]);

  const handleSortChange = (
    newSortBy: "full_name" | "email" | "created_at"
  ) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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
          <p>Fehler beim Laden der Teilnehmer: {error}</p>
          <button
            onClick={() => {
              setIsInitialLoad(true);
              fetchParticipants();
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  console.log(participants);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Teilnehmer ({pagination.total})
        </h2>
        <Link
          href="/intern/participants/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neuen Teilnehmer hinzufügen
        </Link>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Nach Name, E-Mail oder Telefonnummer suchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange("full_name")}
            className={`px-3 py-2 border rounded-md transition-colors ${
              sortBy === "full_name"
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Name {sortBy === "full_name" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSortChange("email")}
            className={`px-3 py-2 border rounded-md transition-colors ${
              sortBy === "email"
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            E-Mail {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSortChange("created_at")}
            className={`px-3 py-2 border rounded-md transition-colors ${
              sortBy === "created_at"
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Erstellt{" "}
            {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {/* Participants List */}
      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {debouncedSearchTerm
            ? "Keine Teilnehmer gefunden."
            : "Noch keine Teilnehmer vorhanden."}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {participants.map((participant) => (
              <Link
                key={participant.participantId}
                href={`/intern/participants/${participant.participantId}`}
                className="block border rounded-lg p-4 hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">
                        {participant.fullName || "Unbekannter Name"}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {participant.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{participant.enrollmentCount || 0} Kurse</span>
                      <span>{participant.eventCount || 0} Events</span>
                      <span>
                        €{(participant?.totalPaid || 0).toFixed(2)} bezahlt
                      </span>
                      {participant.phone && <span>{participant.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded bg-white">
                      Details anzeigen
                    </span>
                    <Link
                      href={`/intern/participants/${participant.participantId}/edit`}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Bearbeiten
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Zeige {(pagination.page - 1) * pagination.limit + 1} bis{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                von {pagination.total} Teilnehmern
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zurück
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Seite {pagination.page} von {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
