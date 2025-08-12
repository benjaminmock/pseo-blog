"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Participant {
  participantId: number;
  fullName: string;
  email: string;
}

interface Course {
  courseId: number;
  courseName: string;
  trainerId: number;
  trainerName: string;
  startDate: string;
  price: number | null;
}

interface Event {
  eventId: number;
  eventName: string;
  trainerId: number;
  trainerName: string;
  startDate: string;
  price: number | null;
}

interface Enrollment {
  enrollmentId: number;
  courseId: number;
  courseName: string;
  totalAmount: number | null;
  paidAmount: number;
  paymentStatus: string;
}

interface Registration {
  registrationId: number;
  eventId: number;
  eventName: string;
  totalAmount: number | null;
  paidAmount: number;
  paymentStatus: string;
}

interface PaymentFormProps {
  participantId?: number;
  courseId?: number;
  eventId?: number;
  enrollmentId?: number;
  registrationId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentForm({
  participantId,
  courseId,
  eventId,
  enrollmentId,
  registrationId,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(
    !participantId
  );

  const [formData, setFormData] = useState({
    participantId: participantId ? participantId.toString() : "",
    courseId: courseId ? courseId.toString() : "",
    eventId: eventId ? eventId.toString() : "",
    enrollmentId: enrollmentId ? enrollmentId.toString() : "",
    registrationId: registrationId ? registrationId.toString() : "",
    amount: "",
    currency: "EUR",
    paymentMethod: "cash",
    status: "completed",
    transactionId: "",
    notes: "",
  });

  useEffect(() => {
    if (!participantId) {
      fetchParticipants();
    }
    if (!courseId) {
      fetchCourses();
    }
    if (!eventId) {
      fetchEvents();
    }
  }, [participantId, courseId, eventId]);

  useEffect(() => {
    if (formData.participantId) {
      fetchEnrollments(parseInt(formData.participantId));
      fetchRegistrations(parseInt(formData.participantId));
    }
  }, [formData.participantId]);

  useEffect(() => {
    // Auto-fill amount based on selected enrollment or registration
    if (formData.enrollmentId) {
      const enrollment = enrollments.find(
        (e) => e.enrollmentId === parseInt(formData.enrollmentId)
      );
      if (enrollment && enrollment.totalAmount) {
        const remainingAmount = enrollment.totalAmount - enrollment.paidAmount;
        if (remainingAmount > 0 && !formData.amount) {
          setFormData((prev) => ({
            ...prev,
            amount: remainingAmount.toString(),
          }));
        }
      }
    } else if (formData.registrationId) {
      const registration = registrations.find(
        (r) => r.registrationId === parseInt(formData.registrationId)
      );
      if (registration && registration.totalAmount) {
        const remainingAmount =
          registration.totalAmount - registration.paidAmount;
        if (remainingAmount > 0 && !formData.amount) {
          setFormData((prev) => ({
            ...prev,
            amount: remainingAmount.toString(),
          }));
        }
      }
    } else if (formData.courseId) {
      const course = courses.find(
        (c) => c.courseId === parseInt(formData.courseId)
      );
      if (course?.price && !formData.amount) {
        setFormData((prev) => ({
          ...prev,
          amount: course.price!.toString(),
        }));
      }
    } else if (formData.eventId) {
      const event = events.find(
        (e) => e.eventId === parseInt(formData.eventId)
      );
      if (event?.price && !formData.amount) {
        setFormData((prev) => ({
          ...prev,
          amount: event.price!.toString(),
        }));
      }
    }
  }, [
    formData.enrollmentId,
    formData.registrationId,
    formData.courseId,
    formData.eventId,
    formData.amount,
    enrollments,
    registrations,
    courses,
    events,
  ]);

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

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses/my");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events/my");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchEnrollments = async (participantId: number) => {
    try {
      const response = await fetch(
        `/api/enrollments?participantId=${participantId}`
      );
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  const fetchRegistrations = async (participantId: number) => {
    try {
      const response = await fetch(
        `/api/registrations?participantId=${participantId}`
      );
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
    }
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

    // Clear related fields when changing participant
    if (name === "participantId") {
      setFormData((prev) => ({
        ...prev,
        enrollmentId: "",
        registrationId: "",
        amount: "",
      }));
    }

    // Clear enrollment when changing course
    if (name === "courseId") {
      setFormData((prev) => ({
        ...prev,
        enrollmentId: "",
        eventId: "",
        registrationId: "",
      }));
    }

    // Clear registration when changing event
    if (name === "eventId") {
      setFormData((prev) => ({
        ...prev,
        registrationId: "",
        courseId: "",
        enrollmentId: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.participantId) {
        setError("Bitte wählen Sie einen Teilnehmer aus");
        setIsSubmitting(false);
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError("Bitte geben Sie einen gültigen Betrag ein");
        setIsSubmitting(false);
        return;
      }

      if (!formData.paymentMethod) {
        setError("Bitte wählen Sie eine Zahlungsmethode aus");
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        participantId: parseInt(formData.participantId),
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        eventId: formData.eventId ? parseInt(formData.eventId) : null,
        enrollmentId: formData.enrollmentId
          ? parseInt(formData.enrollmentId)
          : null,
        registrationId: formData.registrationId
          ? parseInt(formData.registrationId)
          : null,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        transactionId: formData.transactionId || null,
        notes: formData.notes || null,
      };

      const response = await fetch("/api/payments", {
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

      await response.json();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/intern/payments");
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

  const selectedParticipant = participants.find(
    (p) => p.participantId === parseInt(formData.participantId)
  );

  const selectedEnrollment = enrollments.find(
    (e) => e.enrollmentId === parseInt(formData.enrollmentId)
  );

  const selectedRegistration = registrations.find(
    (r) => r.registrationId === parseInt(formData.registrationId)
  );

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Neue Zahlung erfassen
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

        {/* Participant Selection */}
        {!participantId && (
          <div>
            <label
              htmlFor="participantId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teilnehmer auswählen *
            </label>
            {loadingParticipants ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Teilnehmer werden geladen...
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Enrollment/Registration Selection */}
        {selectedParticipant && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="enrollmentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kurs-Anmeldung (optional)
              </label>
              <select
                id="enrollmentId"
                name="enrollmentId"
                value={formData.enrollmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Keine Anmeldung</option>
                {enrollments.map((enrollment) => (
                  <option
                    key={enrollment.enrollmentId}
                    value={enrollment.enrollmentId}
                  >
                    {enrollment.courseName}
                    {enrollment.totalAmount &&
                      ` (${enrollment.paidAmount}€ / ${enrollment.totalAmount}€)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="registrationId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event-Registrierung (optional)
              </label>
              <select
                id="registrationId"
                name="registrationId"
                value={formData.registrationId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Keine Registrierung</option>
                {registrations.map((registration) => (
                  <option
                    key={registration.registrationId}
                    value={registration.registrationId}
                  >
                    {registration.eventName}
                    {registration.totalAmount &&
                      ` (${registration.paidAmount}€ / ${registration.totalAmount}€)`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Course/Event Selection (if no enrollment/registration selected) */}
        {selectedParticipant &&
          !formData.enrollmentId &&
          !formData.registrationId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="courseId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kurs (optional)
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Kein Kurs</option>
                  {courses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseName} - {course.trainerName}
                      {course.price && ` (${course.price}€)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="eventId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event (optional)
                </label>
                <select
                  id="eventId"
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Kein Event</option>
                  {events.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.eventName} - {event.trainerName}
                      {event.price && ` (${event.price}€)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Betrag (€) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="0"
              step="0.01"
              required
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Zahlungsmethode *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="cash">Bargeld</option>
              <option value="transfer">Überweisung</option>
              <option value="card">Karte</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="completed">Abgeschlossen</option>
              <option value="pending">Ausstehend</option>
              <option value="failed">Fehlgeschlagen</option>
            </select>
          </div>
        </div>

        {/* Transaction ID */}
        <div>
          <label
            htmlFor="transactionId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Transaktions-ID (optional)
          </label>
          <input
            type="text"
            id="transactionId"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="z.B. Überweisungsreferenz oder Stripe Payment Intent ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notizen (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Zusätzliche Informationen zur Zahlung..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Payment Summary */}
        {(selectedEnrollment || selectedRegistration) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Zahlungsübersicht
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              {selectedEnrollment && (
                <>
                  <p>
                    <strong>Kurs:</strong> {selectedEnrollment.courseName}
                  </p>
                  <p>
                    <strong>Gesamtbetrag:</strong>{" "}
                    {selectedEnrollment.totalAmount}€
                  </p>
                  <p>
                    <strong>Bereits bezahlt:</strong>{" "}
                    {selectedEnrollment.paidAmount}€
                  </p>
                  <p>
                    <strong>Ausstehend:</strong>{" "}
                    {(selectedEnrollment.totalAmount || 0) -
                      selectedEnrollment.paidAmount}
                    €
                  </p>
                </>
              )}
              {selectedRegistration && (
                <>
                  <p>
                    <strong>Event:</strong> {selectedRegistration.eventName}
                  </p>
                  <p>
                    <strong>Gesamtbetrag:</strong>{" "}
                    {selectedRegistration.totalAmount}€
                  </p>
                  <p>
                    <strong>Bereits bezahlt:</strong>{" "}
                    {selectedRegistration.paidAmount}€
                  </p>
                  <p>
                    <strong>Ausstehend:</strong>{" "}
                    {(selectedRegistration.totalAmount || 0) -
                      selectedRegistration.paidAmount}
                    €
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Wird erfasst..." : "Zahlung erfassen"}
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
    </div>
  );
}
