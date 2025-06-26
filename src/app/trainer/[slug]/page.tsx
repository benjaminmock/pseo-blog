import { db } from "@/config";
import { notFound } from "next/navigation";
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

type Event = {
  event_id: number;
  event_name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  city_name: string | null;
  city_slug: string | null;
  slug: string | null;
  price: number | null;
  max_participants: number | null;
};

type Course = {
  course_id: number;
  course_name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  city_name: string | null;
  city_slug: string | null;
  slug: string | null;
  price: number | null;
  capacity: number | null;
  language: string | null;
  duration: number | null;
  location: string | null;
  style: string | null;
  level: string | null;
};

async function getTrainerBySlug(slug: string): Promise<Trainer | undefined> {
  const stmt = db.prepare(`
    SELECT *
    FROM Trainers
    WHERE slug = ?
  `);
  return stmt.get(slug) as Trainer | undefined;
}

async function getTrainerEvents(trainerId: number): Promise<Event[]> {
  const stmt = db.prepare(`
    SELECT
      e.*,
      c.city as city_name
    FROM Events e
    LEFT JOIN cities c ON e.city_id = c.id
    WHERE e.trainer_id = ? AND e.active = 1
    ORDER BY e.start_date ASC
  `);
  return stmt.all(trainerId) as Event[];
}

async function getTrainerCourses(trainerId: number): Promise<Course[]> {
  const stmt = db.prepare(`
    SELECT
      co.*,
      c.city as city_name
    FROM Courses co
    LEFT JOIN cities c ON co.city_id = c.id
    WHERE co.trainer_id = ? AND co.active = 1
    ORDER BY co.start_date ASC
  `);
  return stmt.all(trainerId) as Course[];
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

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { slug } = params;
  const trainer = await getTrainerBySlug(slug);

  if (!trainer) {
    notFound();
  }

  const isOwnProfile = true; // TODO: Implement user authentication check

  // Fetch events and courses for this trainer
  const [events, courses] = await Promise.all([
    getTrainerEvents(trainer.trainer_id),
    getTrainerCourses(trainer.trainer_id),
  ]);

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
                    key={event.event_id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {event.slug ? (
                          <Link
                            href={`/event/${event.event_id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {event.event_name}
                          </Link>
                        ) : (
                          event.event_name
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
                        {formatDate(event.start_date)}
                        {event.end_date &&
                          event.end_date !== event.start_date && (
                            <span> - {formatDate(event.end_date)}</span>
                          )}
                      </div>

                      {event.start_time && (
                        <div className="flex items-center">
                          <span className="mr-1">🕐</span>
                          {event.start_time}
                          {event.end_time && <span> - {event.end_time}</span>}
                        </div>
                      )}

                      {event.city_name && (
                        <div className="flex items-center">
                          <span className="mr-1">📍</span>
                          {event.city_name}
                        </div>
                      )}

                      {event.max_participants && (
                        <div className="flex items-center">
                          <span className="mr-1">👥</span>
                          max. {event.max_participants} Teilnehmer
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
                    key={course.course_id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {course.slug ? (
                          <Link
                            href={`/kurse/${course.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {course.course_name}
                          </Link>
                        ) : (
                          course.course_name
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
                        {formatDate(course.start_date)}
                        {course.end_date &&
                          course.end_date !== course.start_date && (
                            <span> - {formatDate(course.end_date)}</span>
                          )}
                      </div>

                      {course.city_name && (
                        <div className="flex items-center">
                          <span className="mr-1">📍</span>
                          {course.city_name}
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
