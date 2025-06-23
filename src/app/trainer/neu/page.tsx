import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateTrainerForm from "./_components/CreateTrainerForm";
import { db } from "@/config";

async function checkExistingTrainer(email: string) {
  const stmt = db.prepare(`
    SELECT trainer_id
    FROM Trainers
    WHERE email = ?
  `);
  const result = stmt.get(email) as { trainer_id: number } | undefined;
  return result?.trainer_id;
}

export default async function CreateTrainerPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user already has a trainer profile
  if (user.email) {
    const existingTrainerId = await checkExistingTrainer(user.email);
    if (existingTrainerId) {
      // Redirect to existing trainer profile
      const trainerStmt = db.prepare(`
        SELECT first_name, last_name
        FROM Trainers
        WHERE trainer_id = ?
      `);
      const trainer = trainerStmt.get(existingTrainerId) as {
        first_name: string;
        last_name: string;
      };
      const slug = `${trainer.first_name}-${trainer.last_name}`.toLowerCase();
      redirect(`/trainer/${slug}`);
    }
  }

  // Check if user has teacher role
  const isTeacher = user.role === "teacher";
  if (!isTeacher) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-light mb-8 text-gray-900">
          Trainer-Profil erstellen
        </h1>

        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600 mb-4">
            Sie haben nicht die Berechtigung, ein Trainer-Profil zu erstellen.
            Nur Nutzer mit der Rolle "Lehrer" können Trainer-Profile erstellen.
          </p>
          <a
            href="/profil"
            className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Zurück zum Profil
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">
        Trainer-Profil erstellen
      </h1>

      <div className="bg-white rounded-lg p-6">
        <CreateTrainerForm userEmail={user.email || ""} />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Trainer-Profil erstellen",
  description: "Erstellen Sie Ihr Trainer-Profil",
};
