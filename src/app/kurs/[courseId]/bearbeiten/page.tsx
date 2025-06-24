import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditCourseForm from "./_components/EditCourseForm";
import Link from "next/link";

async function getTrainerIdByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT trainer_id
    FROM Trainers
    WHERE email = ?
  `);
  const result = stmt.get(email) as { trainer_id: number } | undefined;
  return result?.trainer_id;
}

async function getCourseById(courseId: number, trainerId: number) {
  const stmt = db.prepare(`
    SELECT 
      c.course_id,
      c.course_name,
      c.description,
      c.start_date,
      c.end_date,
      c.city_slug,
      c.slug,
      c.city_id,
      c.trainer_id
    FROM Courses c
    WHERE c.course_id = ? AND c.trainer_id = ?
  `);
  return stmt.get(courseId, trainerId) as
    | {
        course_id: number;
        course_name: string;
        description: string;
        start_date: string;
        end_date: string | null;
        city_slug: string | null;
        slug: string | null;
        city_id: number | null;
        trainer_id: number;
      }
    | undefined;
}

// Check if user has teacher role
function isTeacher(user: { role?: string } | null) {
  return user?.role === "teacher";
}

export default async function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has teacher role
  const userIsTeacher = isTeacher(user);
  if (!userIsTeacher) {
    redirect("/intern");
  }

  // Get trainer ID for the logged-in user
  const trainerId = user.email
    ? await getTrainerIdByEmail(user.email)
    : undefined;

  if (!trainerId) {
    redirect("/intern");
  }

  const courseId = parseInt(params.courseId);
  if (isNaN(courseId)) {
    redirect("/intern");
  }

  // Get the course data
  const course = await getCourseById(courseId, trainerId);
  if (!course) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-light mb-8 text-gray-900">
          Kurs bearbeiten
        </h1>

        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600 mb-4">
            Kurs nicht gefunden oder Sie haben keine Berechtigung, diesen Kurs
            zu bearbeiten.
          </p>
          <Link
            href="/intern"
            className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Zurück zum internen Bereich
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/intern"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          ← Zurück zum internen Bereich
        </Link>
      </div>

      <h1 className="text-3xl font-light mb-8 text-gray-900">
        Kurs bearbeiten: {course.course_name}
      </h1>

      <div className="bg-white rounded-lg p-6">
        <EditCourseForm course={course} trainerId={trainerId} />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Kurs bearbeiten",
  description: "Yoga Kurs bearbeiten",
};
