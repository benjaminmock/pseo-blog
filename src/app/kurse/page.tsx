import { db } from "@/config";
import Link from "next/link";

type Course = {
  course_id: number;
  course_name: string;
  trainer_id: number;
  description: string | null;
  start_date: string;
  end_date: string | null;
  city_slug: string | null;
  slug: string | null;
  trainer: {
    first_name: string;
    last_name: string;
  };
};

type PageProps = {
  searchParams: { page?: string };
};

async function getCourses(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Get courses with trainer information
  const stmt = db.prepare(`
    SELECT 
      c.*,
      t.first_name,
      t.last_name
    FROM Courses c
    JOIN Trainers t ON c.trainer_id = t.trainer_id
    ORDER BY c.start_date DESC
    LIMIT ? OFFSET ?
  `);
  const courses = stmt.all(limit + 1, offset) as (Course & {
    first_name: string;
    last_name: string;
  })[];

  // Transform the results to include trainer as a nested object
  const transformedCourses = courses.map((course) => ({
    ...course,
    trainer: {
      first_name: course.first_name,
      last_name: course.last_name,
    },
  })) as Course[];

  // Get total count
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM Courses");
  const { count } = countStmt.get() as { count: number };

  const hasMore = transformedCourses.length > limit;
  if (hasMore) {
    transformedCourses.pop(); // Remove the extra item we fetched to check for more
  }

  return {
    courses: transformedCourses,
    hasMore,
    totalPages: Math.ceil(count / limit),
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const { courses, hasMore, totalPages } = await getCourses(currentPage, 9);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">
        Unsere Yoga Kurse
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.course_id}
            href={`/kurse/${course.course_id}`}
            className="block p-6 bg-white rounded-lg hover:shadow-sm transition-shadow"
          >
            <h2 className="text-xl font-medium mb-2 text-gray-900">
              {course.course_name}
            </h2>
            <div className="text-sm text-gray-600 mb-2">
              mit {course.trainer.first_name} {course.trainer.last_name}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {formatDate(course.start_date)}
              {course.end_date && ` - ${formatDate(course.end_date)}`}
            </div>
            {course.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {course.description}
              </p>
            )}
            <div className="text-indigo-900 text-sm hover:underline">
              Kurs Details →
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-4">
          {currentPage > 1 && (
            <Link
              href={`/kurse?page=${currentPage - 1}`}
              className="px-4 py-2 text-sm bg-white border border-gray-900 rounded-lg hover:bg-gray-50 text-gray-900"
            >
              Vorherige
            </Link>
          )}

          <span className="px-4 py-2 text-sm text-gray-700">
            Seite {currentPage} von {totalPages}
          </span>

          {currentPage < totalPages && (
            <Link
              href={`/kurse?page=${currentPage + 1}`}
              className="px-4 py-2 text-sm bg-white border border-gray-900 rounded-lg hover:bg-gray-50 text-gray-900"
            >
              Nächste
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

export const metadata = {
  title: "Yoga Kurse",
  description: "Übersicht aller Yoga Kurse und deren Details",
};
