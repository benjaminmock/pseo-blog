import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateCourseForm from "./_components/CreateCourseForm";

type Trainer = {
  trainer_id: number;
  first_name: string;
  last_name: string;
};

async function getTrainers() {
  const stmt = db.prepare(`
    SELECT trainer_id, first_name, last_name
    FROM Trainers
    ORDER BY first_name, last_name
  `);
  return stmt.all() as Trainer[];
}

export default async function CreateCoursePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const trainers = await getTrainers();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">Kurs erstellen</h1>

      <div className="bg-white rounded-lg p-6">
        <CreateCourseForm trainers={trainers} />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Kurs erstellen",
  description: "Neuen Yoga Kurs anlegen",
};
