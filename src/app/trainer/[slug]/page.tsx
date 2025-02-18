import { db } from "@/config";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import EditTrainerForm from "./_components/EditTrainerForm";
import Link from "next/link";

type TrainerPageProps = {
  params: {
    slug: string;
  };
};

type Trainer = {
  trainer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  bio: string | null;
  link: string | null;
};

async function getTrainerBySlug(slug: string): Promise<Trainer | undefined> {
  const stmt = db.prepare(`
    SELECT *
    FROM Trainers
    WHERE LOWER(first_name || '-' || last_name) = LOWER(?)
  `);
  return stmt.get(slug) as Trainer | undefined;
}

export async function generateMetadata({ params }: TrainerPageProps) {
  const { slug } = params;
  const trainer = await getTrainerBySlug(slug);

  if (!trainer) {
    return {
      title: "Trainer nicht gefunden",
      description: "Der angeforderte Trainer wurde nicht gefunden",
    };
  }

  return {
    title: `${trainer.first_name} ${trainer.last_name}`,
    description:
      trainer.bio ||
      `Trainer Profil von ${trainer.first_name} ${trainer.last_name}`,
  };
}

export default async function TrainerPage({ params }) {
  const { slug } = params;
  const trainer = await getTrainerBySlug(slug);
  const currentUser = await getCurrentUser();

  if (!trainer) {
    notFound();
  }

  const isOwnProfile = true; //currentUser?.email === trainer.email;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:underline">
              home
            </Link>
          </li>
          <li className="mx-1">/</li>
          <li>
            <Link href={`/trainer`} className="hover:underline">
              Trainer
            </Link>
          </li>
          <li className="mx-1">/</li>
          <li className="text-gray-800 font-semibold">
            {trainer.first_name} {trainer.last_name}
          </li>
        </ol>
      </nav>
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {trainer.first_name} {trainer.last_name}
            </h2>
            <div className="text-6xl mt-4">🧘‍♂️</div>
          </div>
          <div className="w-1/2 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {trainer.first_name} {trainer.last_name}
            </h2>
            {isOwnProfile && (
              <p className="text-sm text-gray-500 mb-4">
                Dies ist dein Profil - du kannst die Informationen bearbeiten.
              </p>
            )}
            {isOwnProfile ? (
              <div>
                <EditTrainerForm trainer={trainer} />
              </div>
            ) : (
              <div className="space-y-6">
                {trainer.bio && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Über mich
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {trainer.bio}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">Kontakt</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-gray-600">Email</dt>
                      <dd className="font-medium">
                        <a
                          href={`mailto:${trainer.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {trainer.email}
                        </a>
                      </dd>
                    </div>
                    {trainer.phone_number && (
                      <div>
                        <dt className="text-gray-600">Telefon</dt>
                        <dd className="font-medium">
                          <a
                            href={`tel:${trainer.phone_number}`}
                            className="text-blue-600 hover:underline"
                          >
                            {trainer.phone_number}
                          </a>
                        </dd>
                      </div>
                    )}
                    {trainer.link && (
                      <div>
                        <dt className="text-gray-600">Website</dt>
                        <dd className="font-medium">
                          <a
                            href={trainer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {trainer.link}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
