import { prisma } from "@/lib/prisma";
import Link from "next/link";

type PageProps = {
  searchParams: { page?: string };
};

async function getTrainers(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Get trainers with pagination - only those with slugs
  const trainers = await prisma.trainer.findMany({
    where: {
      slug: {
        not: null,
      },
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
    skip: offset,
    take: limit + 1, // Take one extra to check if there are more
  });

  // Get total count - only those with slugs
  const count = await prisma.trainer.count({
    where: {
      slug: {
        not: null,
      },
    },
  });

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
            key={trainer.trainerId}
            href={`/trainer/${trainer.slug}`}
            className="block p-6 bg-white rounded-lg  hover:shadow-sm transition-shadow"
          >
            <h2 className="text-xl font-medium mb-2 text-gray-900">
              {trainer.firstName} {trainer.lastName}
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
