import { db } from "@/config";
import { notFound } from "next/navigation";

type CoursePageProps = {
  params: {
    courseSlug: string;
  };
};

type Course = {
  course_id: number;
  course_name: string;
  trainer_id: number;
  description: string;
  start_date: string;
  end_date: string | null;
  city_slug: string;
  slug: string;
  trainer_name?: string;
};

async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const stmt = db.prepare(`
    SELECT c.*, t.first_name || ' '  || t.last_name as trainer_name
    FROM Courses c
    LEFT JOIN Trainers t ON c.trainer_id = t.trainer_id
    WHERE c.slug = ?
  `);
  return stmt.get(slug) as Course | undefined;
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { courseSlug } = params;
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    return {
      title: "Kurs nicht gefunden",
      description: "Der angeforderte Kurs wurde nicht gefunden",
    };
  }

  return {
    title: course.course_name,
    description: course.description,
  };
}

export default async function CoursePage({ params }) {
  const { courseSlug } = params;
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className=" flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {course.course_name}
          </h2>
          {/* <div className="text-6xl mt-4">🧘‍♀️</div> */}
        </div>
        <div className="w-1/2 p-8">
          {/* <h2 className="text-3xl font-bold text-gray-900 mb-4"></h2> */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-500 text-sm">
                Trainer:in / Lehrer:in
              </h3>
              <p className="text-gray-700">{course.trainer_name}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-500 text-sm">
                Startdatum
              </h3>
              <p className="text-gray-700">{formatDate(course.start_date)}</p>
            </div>
            {course.end_date && (
              <div>
                <h3 className="text-lg font-medium text-gray-500 text-sm">
                  Enddatum
                </h3>
                <p className="text-gray-700">{formatDate(course.end_date)}</p>
              </div>
            )}
            {course.city_slug && (
              <div>
                <h3 className="text-lg font-medium text-gray-500 text-sm">
                  Ort
                </h3>
                <p className="text-gray-700 capitalize">
                  {course.city_slug.replace("-", " ")}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-500 text-sm">
                Beschreibung
              </h3>
              <p className="text-gray-700">{course.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
