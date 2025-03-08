import { db } from "@/config";
import Link from "next/link";

type Trainer = {
  trainer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  bio: string | null;
  link: string | null;
};

type PageProps = {
  searchParams: { page?: string };
};

async function getTrainers(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Get trainers with pagination
  const stmt = db.prepare(`
    SELECT *
    FROM Trainers
    ORDER BY first_name, last_name
    LIMIT ? OFFSET ?
  `);
  const trainers = stmt.all(limit + 1, offset) as Trainer[];

  // Get total count
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM Trainers");
  const { count } = countStmt.get() as { count: number };

  const hasMore = trainers.length > limit;
  if (hasMore) {
    trainers.pop(); // Remove the extra item we fetched to check for more
  }

  return {
    trainers,
    hasMore,
    totalPages: Math.ceil(count / limit),
  };
}

function getTrainerSlug(trainer: Trainer) {
  return `${trainer.first_name}-${trainer.last_name}`.toLowerCase();
}

export default async function TrainersPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const { trainers, totalPages } = await getTrainers(currentPage, 9);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">
        Unsere Yoga Trainer
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <Link
            key={trainer.trainer_id}
            href={`/trainer/${getTrainerSlug(trainer)}`}
            className="block p-6 bg-white rounded-lg  hover:shadow-sm transition-shadow"
          >
            <h2 className="text-xl font-medium mb-2 text-gray-900">
              {trainer.first_name} {trainer.last_name}
            </h2>
            {trainer.bio && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {trainer.bio}
              </p>
            )}
            <div className="text-indigo-900 text-sm hover:underline">
              Profil ansehen →
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-4">
          {currentPage > 1 && (
            <Link
              href={`/trainer?page=${currentPage - 1}`}
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
              href={`/trainer?page=${currentPage + 1}`}
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
  title: "Unsere Trainer",
  description: "Übersicht aller Trainer und ihrer Profile",
};
