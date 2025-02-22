import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InternPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">
        Interner Bereich
      </h1>

      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2 text-gray-900">
            Willkommen, {user.name || user.email}!
          </h2>
          <p className="text-gray-600">
            Dies ist der geschützte interne Bereich. Hier findest du zusätzliche
            Informationen und Funktionen.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/profile"
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Dein Profil
                </h3>
                <p className="text-sm text-gray-600">
                  Verwalte deine persönlichen Einstellungen
                </p>
              </div>
              <span className="text-indigo-900">→</span>
            </div>
          </Link>

          <Link
            href="/kurs/neu"
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Kurs erstellen
                </h3>
                <p className="text-sm text-gray-600">Neuen Yoga Kurs anlegen</p>
              </div>
              <span className="text-indigo-900">→</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Interner Bereich",
  description: "Geschützter Bereich für eingeloggte Benutzer",
};
