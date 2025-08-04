"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  courseId: number;
  courseName: string;
  description: string;
  startDate: string;
  endDate: string | null;
  city_slug: string | null;
  slug: string | null;
  active: number;
  price: number | null;
  maxCapacity: number | null;
  currentEnrollments: number;
  trainerName: string;
}

export default function ActiveCoursesWidget() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveCourses();
  }, []);

  const fetchActiveCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses/my");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  const getCapacityColor = (current: number, max: number | null) => {
    if (!max) return "text-gray-600";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Aktuelle Kurse
        </h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Aktuelle Kurse
        </h3>
        <div className="text-red-600 text-sm">
          <p>Fehler beim Laden: {error}</p>
          <button
            onClick={fetchActiveCourses}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Aktuelle Kurse</h3>
        <Link
          href="/intern"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Alle anzeigen
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm mb-2">Keine aktiven Kurse</p>
          <Link
            href="/kurs/neu"
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Ersten Kurs erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.slice(0, 5).map((course) => (
            <div
              key={course.courseId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {course.courseName}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  <span>Start: {formatDate(course.startDate)}</span>
                  {course.city_slug && <span>📍 {course.city_slug}</span>}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-medium ${getCapacityColor(
                    course.currentEnrollments,
                    course.maxCapacity
                  )}`}
                >
                  {course.currentEnrollments}
                  {course.maxCapacity ? `/${course.maxCapacity}` : ""}
                </div>
                <div className="text-xs text-gray-500">Teilnehmer</div>
              </div>
            </div>
          ))}

          {courses.length > 5 && (
            <div className="text-center pt-2">
              <Link
                href="/intern"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                +{courses.length - 5} weitere Kurse
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
