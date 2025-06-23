import { db } from "@/config";
import { notFound } from "next/navigation";
import Link from "next/link";

type CoursePageProps = {
  params: {
    courseSlug: string;
  };
};

type Course = {
  course_id: number;
  course_name: string;
  trainer_id: number;
  description: string | null;
  start_date: string;
  end_date: string | null;
  city_slug: string | null;
  city_name: string | null;
  slug: string | null;
  trainer: {
    first_name: string;
    last_name: string;
    bio: string | null;
    link: string | null;
  };
};

async function getCourseById(id: string): Promise<Course | undefined> {
  const stmt = db.prepare(`
    SELECT
      c.*,
      t.first_name,
      t.last_name,
      t.bio,
      t.link,
      city.city as city_name
    FROM Courses c
    LEFT JOIN Trainers t ON c.trainer_id = t.trainer_id
    LEFT JOIN cities city ON c.city_slug = city.slug
    WHERE c.course_id = ? AND c.active = 1
  `);

  const result = stmt.get(id) as
    | (Course & {
        first_name: string;
        last_name: string;
        bio: string | null;
        link: string | null;
        city_name: string | null;
      })
    | undefined;

  if (!result) return undefined;

  return {
    ...result,
    trainer: {
      first_name: result.first_name,
      last_name: result.last_name,
      bio: result.bio,
      link: result.link,
    },
  };
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { courseSlug } = params;
  const course = await getCourseById(courseSlug);

  if (!course) {
    return {
      title: "Kurs nicht gefunden",
      description: "Der angeforderte Kurs wurde nicht gefunden",
    };
  }

  return {
    title: course.course_name,
    description:
      course.description ||
      `Yoga Kurs mit ${course.trainer.first_name} ${course.trainer.last_name}`,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = params;
  const course = await getCourseById(courseSlug);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {course.course_name}
          </h1>
        </div>
        <div className="md:w-1/2 p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-500 text-sm">
                Trainer:in
              </h2>
              <Link
                href={`/t/${course.trainer.first_name.toLowerCase()}-${course.trainer.last_name.toLowerCase()}`}
                className="text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {course.trainer.first_name} {course.trainer.last_name}
              </Link>
              {course.trainer.bio && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {course.trainer.bio}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-500 text-sm">
                Zeitraum
              </h2>
              <p className="text-gray-900">
                {formatDate(course.start_date)}
                {course.end_date && ` - ${formatDate(course.end_date)}`}
              </p>
            </div>
            {(course.city_name || course.city_slug) && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Ort
                </h2>
                <p className="text-gray-900 capitalize">
                  {course.city_name || course.city_slug?.replace("-", " ")}
                </p>
              </div>
            )}
            {course.description && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Beschreibung
                </h2>
                <p className="text-gray-900 whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/kurse"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              ← Zurück zur Kursübersicht
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
