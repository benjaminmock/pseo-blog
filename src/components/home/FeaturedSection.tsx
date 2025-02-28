import Image from "next/image";
import Link from "next/link";

// Mock data - in a real app, this would come from an API
const featuredClasses = [
  {
    id: 1,
    title: "Vinyasa Flow für Anfänger",
    instructor: "Sarah Schmidt",
    rating: 4.9,
    reviews: 128,
    image: "/hero-images/24103-kiel.jpg",
    price: "20€",
  },
  {
    id: 2,
    title: "Yin Yoga für Entspannung",
    instructor: "Julia Weber",
    rating: 4.8,
    reviews: 96,
    image: "/hero-images/berlin.jpg",
    price: "25€",
  },
  {
    id: 3,
    title: "Sanftes Hatha Yoga",
    instructor: "Marie Müller",
    rating: 5.0,
    reviews: 64,
    image: "/hero-images/24937-flensburg.jpg",
    price: "18€",
  },
];

const featuredInstructors = [
  {
    id: 1,
    name: "Sarah Schmidt",
    specialty: "Vinyasa & Yin Yoga",
    rating: 4.9,
    students: 1200,
    image: "/hero-images/20038-hamburg.jpg",
  },
  {
    id: 2,
    name: "Julia Weber",
    specialty: "Hatha & Yin Yoga",
    rating: 4.8,
    students: 850,
    image: "/hero-images/lauenburgelbe.jpg",
  },
];

export default function FeaturedSection() {
  return (
    <section className="container mx-auto px-4">
      {/* Featured Classes */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Beliebte Kurse</h2>
          <Link
            href="/kurse"
            className="text-purple-600 font-semibold hover:text-purple-700"
          >
            Alle Kurse ansehen →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredClasses.map((class_) => (
            <div
              key={class_.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={class_.image}
                  alt={class_.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{class_.title}</h3>
                <p className="text-gray-600 mb-4">mit {class_.instructor}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="font-medium">{class_.rating}</span>
                    <span className="text-gray-500 ml-1">
                      ({class_.reviews} Bewertungen)
                    </span>
                  </div>
                  <span className="font-semibold">{class_.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Instructors */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Erfahrene Yogalehrer
          </h2>
          <Link
            href="/trainer"
            className="text-purple-600 font-semibold hover:text-purple-700"
          >
            Alle Lehrer ansehen →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex">
                <div className="relative w-40 h-40">
                  <Image
                    src={instructor.image}
                    alt={instructor.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 160px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {instructor.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{instructor.specialty}</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="font-medium">{instructor.rating}</span>
                      <span className="text-gray-500 ml-2">Bewertung</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{instructor.students}</span>
                      <span className="text-gray-500 ml-2">Schüler</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
