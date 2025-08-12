"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticipantForm from "../ParticipantManager/ParticipantForm";

interface Course {
  courseId: number;
  courseName: string;
  trainerId: number;
  trainerName: string;
  startDate: string;
  price: number | null;
  maxCapacity: number | null;
  currentEnrollments: number;
}

interface Participant {
  participantId: number;
  fullName: string;
  email: string;
}

interface EnrollmentFormProps {
  courseId?: number;
  participantId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EnrollmentForm({
  courseId,
  participantId,
  onSuccess,
  onCancel,
}: EnrollmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(!courseId);
  const [loadingParticipants, setLoadingParticipants] = useState(
    !participantId
  );
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  const [formData, setFormData] = useState({
    courseId: courseId ? courseId.toString() : "",
    participantId: participantId ? participantId.toString() : "",
    status: "active",
    paymentStatus: "pending",
    totalAmount: "",
    paidAmount: "0",
    notes: "",
  });

  useEffect(() => {
    if (!courseId) {
      fetchCourses();
    }
    if (!participantId) {
      fetchParticipants();
    }
  }, [courseId, participantId]);

  useEffect(() => {
    if (formData.courseId) {
      const selectedCourse = courses.find(
        (c) => c.courseId === parseInt(formData.courseId.toString())
      );
      if (selectedCourse?.price && !formData.totalAmount) {
        setFormData((prev) => ({
          ...prev,
          totalAmount: selectedCourse.price!.toString(),
        }));
      }
    }
  }, [formData.courseId, formData.totalAmount, courses]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch("/api/courses/my");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const response = await fetch("/api/participants");
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleParticipantCreated = () => {
    setShowParticipantModal(false);
    fetchParticipants(); // Refresh the participants list
  };

  const handleAddParticipantClick = () => {
    setShowParticipantModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.courseId || formData.courseId === "") {
        setError("Bitte wählen Sie einen Kurs aus");
        setIsSubmitting(false);
        return;
      }

      if (!formData.participantId || formData.participantId === "") {
        setError("Bitte wählen Sie einen Teilnehmer aus");
        setIsSubmitting(false);
        return;
      }

      const courseIdNum = parseInt(formData.courseId.toString());
      const participantIdNum = parseInt(formData.participantId.toString());

      // Debug logging
      console.log("Form data:", formData);
      console.log("Parsed courseId:", courseIdNum);
      console.log("Parsed participantId:", participantIdNum);

      // Additional validation for parsed numbers
      if (isNaN(courseIdNum) || courseIdNum <= 0) {
        setError(`Ungültige Kurs-ID: ${formData.courseId}`);
        setIsSubmitting(false);
        return;
      }

      if (isNaN(participantIdNum) || participantIdNum <= 0) {
        setError(`Ungültige Teilnehmer-ID: ${formData.participantId}`);
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        ...formData,
        courseId: courseIdNum,
        participantId: participantIdNum,
        totalAmount: formData.totalAmount
          ? parseFloat(formData.totalAmount.toString())
          : null,
        paidAmount: formData.paidAmount
          ? parseFloat(formData.paidAmount.toString())
          : 0,
      };

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ein Fehler ist aufgetreten");
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/intern/enrollments/${result.enrollmentId}`);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourse = courses.find(
    (c) => c.courseId === parseInt(formData.courseId.toString())
  );
  const isCourseFull =
    selectedCourse &&
    selectedCourse.maxCapacity &&
    selectedCourse.currentEnrollments >= selectedCourse.maxCapacity;

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Neue Kurs-Anmeldung
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-red-700 bg-red-50 rounded-md">{error}</div>
        )}

        {/* Course Selection */}
        {!courseId && (
          <div>
            <label
              htmlFor="courseId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kurs auswählen *
            </label>
            {loadingCourses ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Kurse werden geladen...
              </div>
            ) : (
              <select
                id="courseId"
                name="courseId"
                required
                value={formData.courseId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Kurs auswählen</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName} - {course.trainerName}
                    {course.maxCapacity &&
                      ` (${course.currentEnrollments}/${course.maxCapacity})`}
                  </option>
                ))}
              </select>
            )}
            {isCourseFull && (
              <p className="mt-1 text-sm text-red-600">
                ⚠️ Dieser Kurs ist bereits ausgebucht. Die Anmeldung wird zur
                Warteliste hinzugefügt.
              </p>
            )}
          </div>
        )}

        {/* Participant Selection */}
        {!participantId && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="participantId"
                className="block text-sm font-medium text-gray-700"
              >
                Teilnehmer auswählen *
              </label>
              {!loadingParticipants && participants.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddParticipantClick}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Neuen Teilnehmer hinzufügen
                </button>
              )}
            </div>
            {loadingParticipants ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Teilnehmer werden geladen...
              </div>
            ) : participants.length === 0 ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-50 text-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Keine Teilnehmer vorhanden</span>
                  <button
                    type="button"
                    onClick={handleAddParticipantClick}
                    className="ml-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                  >
                    Teilnehmer hinzufügen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  id="participantId"
                  name="participantId"
                  required
                  value={formData.participantId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Teilnehmer auswählen</option>
                  {participants.map((participant) => (
                    <option
                      key={participant.participantId}
                      value={participant.participantId}
                    >
                      {participant.fullName} ({participant.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddParticipantClick}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  + Weiteren Teilnehmer hinzufügen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Anmeldestatus
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Aktiv</option>
              <option value="waitlist">Warteliste</option>
              <option value="cancelled">Storniert</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="paymentStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Zahlungsstatus
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">Ausstehend</option>
              <option value="paid">Bezahlt</option>
              <option value="partial">Teilweise bezahlt</option>
              <option value="refunded">Erstattet</option>
            </select>
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="totalAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gesamtbetrag (€)
            </label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              min="0"
              step="0.01"
              value={formData.totalAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="paidAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bereits bezahlt (€)
            </label>
            <input
              type="number"
              id="paidAmount"
              name="paidAmount"
              min="0"
              step="0.01"
              value={formData.paidAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notizen
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Besondere Hinweise zur Anmeldung..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Course Information Display */}
        {selectedCourse && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Kurs-Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Kurs:</strong> {selectedCourse.courseName}
              </p>
              <p>
                <strong>Trainer:</strong> {selectedCourse.trainerName}
              </p>
              <p>
                <strong>Startdatum:</strong>{" "}
                {new Date(selectedCourse.startDate).toLocaleDateString("de-DE")}
              </p>
              {selectedCourse.price && (
                <p>
                  <strong>Preis:</strong> {selectedCourse.price.toFixed(2)} €
                </p>
              )}
              {selectedCourse.maxCapacity && (
                <p>
                  <strong>Kapazität:</strong>{" "}
                  {selectedCourse.currentEnrollments}/
                  {selectedCourse.maxCapacity}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || loadingCourses || loadingParticipants}
            className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Wird erstellt..." : "Anmeldung erstellen"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      {/* Participant Modal */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ParticipantForm
              onSuccess={handleParticipantCreated}
              onCancel={() => setShowParticipantModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
