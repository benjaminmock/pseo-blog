import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: "student" | "instructor";
  image: string;
  quote: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Lisa Schmidt",
    role: "student",
    image: "/hero-images/20038-hamburg.jpg",
    quote:
      "Den perfekten Yoga-Kurs zu finden war noch nie so einfach. Die Vielfalt der Kurse und die Qualität des Unterrichts haben meine Praxis verändert.",
    location: "Hamburg",
  },
  {
    id: 2,
    name: "Thomas Weber",
    role: "instructor",
    image: "/hero-images/berlin.jpg",
    quote:
      "Als Lehrer hat mir diese Plattform geholfen, mehr Schüler zu erreichen und meine Lehrtätigkeit auszubauen. Die Tools machen die Kursverwaltung mühelos.",
    location: "Berlin",
  },
  {
    id: 3,
    name: "Marie Müller",
    role: "student",
    image: "/hero-images/24103-kiel.jpg",
    quote:
      "Die Flexibilität, zwischen Online- und Präsenzkursen zu wählen, hat es mir viel einfacher gemacht, meine Yoga-Praxis aufrechtzuerhalten.",
    location: "Kiel",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Was unsere Community sagt
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-md p-6 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6 bg-purple-600 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                </svg>
              </div>

              {/* Testimonial Content */}
              <div className="mb-6 pt-6">
                <p className="text-gray-600 italic mb-4">{testimonial.quote}</p>
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500">
                    {testimonial.role === "instructor"
                      ? "Yoga-Lehrer"
                      : "Yoga-Schüler"}{" "}
                    • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">1000+</div>
              <div className="text-gray-600">Aktive Schüler</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">200+</div>
              <div className="text-gray-600">Zertifizierte Lehrer</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">500+</div>
              <div className="text-gray-600">Kurse pro Woche</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">4.8</div>
              <div className="text-gray-600">Durchschnittliche Bewertung</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
