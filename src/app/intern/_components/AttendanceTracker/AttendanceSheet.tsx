"use client";

import { useState, useEffect, useCallback } from "react";

interface AttendanceParticipant {
  participantId: number;
  fullName: string;
  email: string;
  enrollmentId?: number;
  registrationId?: number;
  attended: number; // 0 = absent, 1 = present, 2 = late
  checkInTime?: string;
  notes?: string;
}

interface AttendanceSheetProps {
  courseId?: number;
  eventId?: number;
  sessionDate: string;
  sessionNumber?: number;
  onSave?: () => void;
}

export default function AttendanceSheet({
  courseId,
  eventId,
  sessionDate,
  sessionNumber,
  onSave,
}: AttendanceSheetProps) {
  const [participants, setParticipants] = useState<AttendanceParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      let url = "";

      if (courseId) {
        url = `/api/enrollments/course/${courseId}`;
      } else if (eventId) {
        url = `/api/registrations?eventId=${eventId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }

      const data = await response.json();
      const enrollmentsOrRegistrations = courseId
        ? data.enrollments
        : data.registrations;

      // Check if attendance already exists for this session
      const attendanceResponse = await fetch(
        `/api/attendance?${
          courseId ? `courseId=${courseId}` : `eventId=${eventId}`
        }&sessionDate=${sessionDate}`
      );

      let existingAttendance: Array<{
        participantId: number;
        attended: number;
        checkInTime?: string;
        notes?: string;
      }> = [];
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        existingAttendance = attendanceData.attendance || [];
      }

      const participantList: AttendanceParticipant[] =
        enrollmentsOrRegistrations.map(
          (item: {
            participantId: number;
            participantName: string;
            participantEmail: string;
            enrollmentId?: number;
            registrationId?: number;
          }) => {
            const existing = existingAttendance.find(
              (att) => att.participantId === item.participantId
            );

            return {
              participantId: item.participantId,
              fullName: item.participantName,
              email: item.participantEmail,
              enrollmentId: courseId ? item.enrollmentId : undefined,
              registrationId: eventId ? item.registrationId : undefined,
              attended: existing?.attended || 0,
              checkInTime: existing?.checkInTime || "",
              notes: existing?.notes || "",
            };
          }
        );

      setParticipants(participantList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [courseId, eventId, sessionDate]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const updateAttendance = (
    participantId: number,
    field: keyof AttendanceParticipant,
    value: string | number
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.participantId === participantId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSelectAll = (status: 0 | 1 | 2) => {
    const currentTime = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        attended: status,
        checkInTime: status > 0 ? currentTime : "",
      }))
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);

      const attendanceData = participants.map((p) => ({
        participantId: p.participantId,
        courseId: courseId || null,
        eventId: eventId || null,
        sessionDate,
        sessionNumber: sessionNumber || null,
        attended: p.attended,
        checkInTime: p.checkInTime || null,
        notes: p.notes || null,
      }));

      const response = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId || null,
          eventId: eventId || null,
          sessionDate,
          sessionNumber: sessionNumber || null,
          attendanceRecords: attendanceData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save attendance");
      }

      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const present = participants.filter((p) => p.attended === 1).length;
    const late = participants.filter((p) => p.attended === 2).length;
    const absent = participants.filter((p) => p.attended === 0).length;
    const total = participants.length;

    return { present, late, absent, total };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900">
            Anwesenheitsliste
          </h2>
          <p className="text-sm text-gray-600">
            {new Date(sessionDate).toLocaleDateString("de-DE")}
            {sessionNumber && ` - Einheit ${sessionNumber}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {stats.present + stats.late}/{stats.total} anwesend
          </div>
          <div className="text-xs text-gray-500">
            {stats.present} pünktlich, {stats.late} verspätet, {stats.absent}{" "}
            abwesend
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          Alle markieren als:
        </span>
        <button
          onClick={() => handleSelectAll(1)}
          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
        >
          Anwesend
        </button>
        <button
          onClick={() => handleSelectAll(2)}
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
        >
          Verspätet
        </button>
        <button
          onClick={() => handleSelectAll(0)}
          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Abwesend
        </button>
      </div>

      {/* Participants List */}
      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Teilnehmer gefunden.
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.participantId}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {participant.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">{participant.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Attendance Status */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${participant.participantId}`}
                        checked={participant.attended === 1}
                        onChange={() => {
                          updateAttendance(
                            participant.participantId,
                            "attended",
                            1
                          );
                          updateAttendance(
                            participant.participantId,
                            "checkInTime",
                            new Date().toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          );
                        }}
                        className="mr-1"
                      />
                      <span className="text-sm text-green-700">Anwesend</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${participant.participantId}`}
                        checked={participant.attended === 2}
                        onChange={() => {
                          updateAttendance(
                            participant.participantId,
                            "attended",
                            2
                          );
                          updateAttendance(
                            participant.participantId,
                            "checkInTime",
                            new Date().toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          );
                        }}
                        className="mr-1"
                      />
                      <span className="text-sm text-yellow-700">Verspätet</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${participant.participantId}`}
                        checked={participant.attended === 0}
                        onChange={() => {
                          updateAttendance(
                            participant.participantId,
                            "attended",
                            0
                          );
                          updateAttendance(
                            participant.participantId,
                            "checkInTime",
                            ""
                          );
                        }}
                        className="mr-1"
                      />
                      <span className="text-sm text-red-700">Abwesend</span>
                    </label>
                  </div>

                  {/* Check-in Time */}
                  {participant.attended > 0 && (
                    <input
                      type="time"
                      value={participant.checkInTime}
                      onChange={(e) =>
                        updateAttendance(
                          participant.participantId,
                          "checkInTime",
                          e.target.value
                        )
                      }
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Notizen..."
                  value={participant.notes}
                  onChange={(e) =>
                    updateAttendance(
                      participant.participantId,
                      "notes",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveAttendance}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Wird gespeichert..." : "Anwesenheit speichern"}
        </button>
      </div>
    </div>
  );
}
