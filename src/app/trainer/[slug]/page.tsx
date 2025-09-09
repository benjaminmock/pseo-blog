import { notFound } from "next/navigation";
import EditTrainerForm from "./_components/EditTrainerForm";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type TrainerPageProps = {
  params: {
    slug: string;
  };
};

async function getTrainerBySlug(slug: string) {
  return await prisma.trainer.findUnique({
    where: { slug },
    include: {
      avatarFile: true,
      events: {
        where: { active: 1 },
        include: {
          city: true,
        },
        orderBy: { startDate: "asc" },
      },
      courses: {
        where: { active: 1 },
        include: {
          city: true,
        },
        orderBy: { startDate: "asc" },
      },
    },
  });
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
    title: `${trainer.firstName} ${trainer.lastName}`,
    description:
      trainer.bio ||
      `Trainer Profil von ${trainer.firstName} ${trainer.lastName}`,
  };
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { slug } = params;
  const trainer = await getTrainerBySlug(slug);

  if (!trainer) {
    notFound();
  }

  // Check if this is the user's own profile
  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.email === trainer.email;

  const events = trainer.events;
  const courses = trainer.courses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Preis auf Anfrage";
    return `${price}€`;
  };

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
            {trainer.firstName} {trainer.lastName}
          </li>
        </ol>
      </nav>
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
            {/* Avatar Display */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-4">
              {trainer.avatarFile?.url ? (
                <Image
                  src={trainer.avatarFile.url}
                  alt={`${trainer.firstName} ${trainer.lastName}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-5xl">👤</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {trainer.firstName} {trainer.lastName}
            </h2>
          </div>
          <div className="w-1/2 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {trainer.firstName} {trainer.lastName}
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
                    {trainer.phoneNumber && (
                      <div>
                        <dt className="text-gray-600">Telefon</dt>
                        <dd className="font-medium">
                          <a
                            href={`tel:${trainer.phoneNumber}`}
                            className="text-blue-600 hover:underline"
                          >
                            {trainer.phoneNumber}
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

      {/* Events and Courses Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Workshops & Events
            </h3>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.eventId}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {event.slug ? (
                          <Link
                            href={`/events/${event.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {event.eventName}
                          </Link>
                        ) : (
                          event.eventName
                        )}
                      </h4>
                      {event.price && (
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(event.price)}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate && (
                          <span> - {formatDate(event.endDate)}</span>
                        )}
                      </div>

                      {event.startTime && (
                        <div className="flex items-center">
                          <span className="mr-1">🕐</span>
                          {event.startTime}
                          {event.endTime && <span> - {event.endTime}</span>}
                        </div>
                      )}

                      {event.city?.city && (
                        <div className="flex items-center">
                          <span className="mr-1">📍</span>
                          {event.city.city}
                        </div>
                      )}

                      {event.maxParticipants && (
                        <div className="flex items-center">
                          <span className="mr-1">👥</span>
                          max. {event.maxParticipants} Teilnehmer
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Derzeit keine Events verfügbar.
              </p>
            )}
          </div>

          {/* Courses Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Kurse</h3>
            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.courseId}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {course.slug ? (
                          <Link
                            href={`/kurse/${course.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {course.courseName}
                          </Link>
                        ) : (
                          course.courseName
                        )}
                      </h4>
                      {course.price && (
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(course.price)}
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        {formatDate(course.startDate)}
                        {course.endDate &&
                          course.endDate !== course.startDate && (
                            <span> - {formatDate(course.endDate)}</span>
                          )}
                      </div>

                      {course.city?.city && (
                        <div className="flex items-center">
                          <span className="mr-1">📍</span>
                          {course.city.city}
                        </div>
                      )}

                      {course.capacity && (
                        <div className="flex items-center">
                          <span className="mr-1">👥</span>
                          max. {course.capacity} Teilnehmer
                        </div>
                      )}

                      {course.duration && (
                        <div className="flex items-center">
                          <span className="mr-1">⏱️</span>
                          {course.duration} Min.
                        </div>
                      )}
                    </div>

                    {(course.style || course.level || course.language) && (
                      <div className="flex flex-wrap gap-2">
                        {course.style && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {course.style}
                          </span>
                        )}
                        {course.level && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {course.level}
                          </span>
                        )}
                        {course.language && (
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            {course.language}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Derzeit keine Kurse verfügbar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
