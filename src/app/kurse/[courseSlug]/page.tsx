import { db } from "@/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

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
  capacity: number | null;
  language: string | null;
  price: number | null;
  duration: number | null;
  location: string | null;
  style: string | null;
  level: string | null;
  trainer: {
    first_name: string;
    last_name: string;
    bio: string | null;
    link: string | null;
    slug: string | null;
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
      t.slug as trainer_slug,
      city.city as city_name
    FROM Courses c
    LEFT JOIN Trainers t ON c.trainer_id = t.trainer_id
    LEFT JOIN cities city ON c.city_slug = city.slug
    WHERE c.slug = ? AND c.active = 1
  `);

  const result = stmt.get(id) as
    | (Course & {
        first_name: string;
        last_name: string;
        bio: string | null;
        link: string | null;
        trainer_slug: string | null;
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
      slug: result.trainer_slug,
    },
  };
}

async function getTrainerIdByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT trainer_id
    FROM Trainers
    WHERE email = ?
  `);
  const result = stmt.get(email) as { trainer_id: number } | undefined;
  return result?.trainer_id;
}

// Check if user has teacher role
function isTeacher(user: { role?: string } | null) {
  return user?.role === "teacher";
}

// Check if the logged-in user owns this course
async function isUserCourseOwner(
  course: Course,
  user: { email?: string | null; role?: string } | null
) {
  if (!user || !isTeacher(user) || !user.email) {
    return false;
  }

  const trainerId = await getTrainerIdByEmail(user.email);
  return trainerId === course.trainer_id;
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

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function formatDuration(duration: number | null) {
  if (!duration) return null;
  return `${duration} Minuten`;
}

function formatLanguage(language: string | null) {
  if (!language) return null;
  return language === "de" ? "Deutsch" : "English";
}

function formatLevel(level: string | null) {
  if (!level) return null;
  const levelMap = {
    beginner: "Anfänger",
    intermediate: "Fortgeschritten",
    advanced: "Experte",
  };
  return levelMap[level as keyof typeof levelMap] || level;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = params;
  const course = await getCourseById(courseSlug);

  if (!course) {
    notFound();
  }

  // Get current user and check if they own this course
  const user = await getCurrentUser();
  const userOwnsThisCourse = await isUserCourseOwner(course, user);

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
                Trainer*in / Lehrer*in
              </h2>
              {course.trainer.slug ? (
                <Link
                  href={`/trainer/${course.trainer.slug}`}
                  className="text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {course.trainer.first_name} {course.trainer.last_name}
                </Link>
              ) : (
                <span className="text-gray-900">
                  {course.trainer.first_name} {course.trainer.last_name}
                </span>
              )}
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
            {(course.city_name || course.city_slug || course.location) && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Ort
                </h2>
                <div className="text-gray-900">
                  {course.city_name && (
                    <p className="capitalize">{course.city_name}</p>
                  )}
                  {!course.city_name && course.city_slug && (
                    <p className="capitalize">
                      {course.city_slug.replace("-", " ")}
                    </p>
                  )}
                  {course.location && (
                    <p className="text-gray-700 text-sm mt-1">
                      {course.location}
                    </p>
                  )}
                </div>
              </div>
            )}
            {course.price && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Preis
                </h2>
                <p className="text-gray-900">{formatPrice(course.price)}</p>
              </div>
            )}
            {course.duration && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Dauer
                </h2>
                <p className="text-gray-900">
                  {formatDuration(course.duration)}
                </p>
              </div>
            )}
            {course.capacity && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Kapazität
                </h2>
                <p className="text-gray-900">{course.capacity} Teilnehmer</p>
              </div>
            )}
            {course.language && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Sprache
                </h2>
                <p className="text-gray-900">
                  {formatLanguage(course.language)}
                </p>
              </div>
            )}
            {course.style && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Stil
                </h2>
                <p className="text-gray-900">{course.style}</p>
              </div>
            )}
            {course.level && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Level
                </h2>
                <p className="text-gray-900">{formatLevel(course.level)}</p>
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

          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Link
              href="/kurse"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              ← Zurück zur Kursübersicht
            </Link>
            {userOwnsThisCourse && (
              <Link
                href={`/kurs/${course.course_id}/bearbeiten`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Kurs bearbeiten
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
