import Link from "next/link";

interface YogaStyle {
  name: string;
  description: string;
}

const yogaStyles: YogaStyle[] = [
  {
    name: "Hatha Yoga",
    description:
      "Eine sanfte, grundlegende Form des Yoga, die Körperhaltungen mit Atemtechniken verbindet. Perfekt für Anfänger, die die Grundlagen verstehen möchten.",
  },
  {
    name: "Vinyasa Flow",
    description:
      "Eine dynamische Praxis, die Atem mit Bewegung synchronisiert. Entwickelt Kraft, Flexibilität und kardiovaskuläre Fitness durch fließende Sequenzen.",
  },
  {
    name: "Yin Yoga",
    description:
      "Ein langsamer Stil, bei dem Positionen länger gehalten werden. Verbessert Flexibilität und Gelenkbeweglichkeit bei gleichzeitiger Entspannung und Stressabbau.",
  },
  {
    name: "Ashtanga Yoga",
    description:
      "Ein anspruchsvoller Stil, der einer bestimmten Sequenz von Haltungen folgt. Entwickelt Kraft, Flexibilität und mentalen Fokus durch konsequente Praxis.",
  },
];

const healthBenefits = [
  {
    title: "Körperliche Gesundheit",
    benefits: [
      "Verbesserte Flexibilität und Balance",
      "Gesteigerte Kraft und Muskeltonus",
      "Bessere Haltung und Wirbelsäulengesundheit",
      "Erhöhte Atemkapazität",
    ],
  },
  {
    title: "Mentales Wohlbefinden",
    benefits: [
      "Reduzierter Stress und Angst",
      "Verbesserte Konzentration",
      "Bessere Schlafqualität",
      "Gestärkte Körper-Geist-Verbindung",
    ],
  },
];

export default function WhyYogaSection() {
  return (
    <section data-testid="why-yoga-section" className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Warum Yoga praktizieren?
        </h2>

        {/* Health Benefits */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {healthBenefits.map((category) => (
            <div
              key={category.title}
              className="bg-white rounded-xl shadow-md p-6 text-gray-800"
            >
              <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
              <ul className="space-y-3">
                {category.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Yoga Styles */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Finde deinen Stil
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {yogaStyles.map((style) => (
              <div
                key={style.name}
                className="bg-white text-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h4 className="text-xl font-semibold mb-2">{style.name}</h4>
                <p className="text-gray-600">{style.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Your Journey CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 mb-6">
            Ob du deine Flexibilität verbessern, Stress abbauen oder inneren
            Frieden finden möchtest - es gibt einen Yoga-Stil, der perfekt zu
            dir passt.
          </p>
          <Link
            href="/kurse"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Starte deine Yoga-Reise
          </Link>
        </div>
      </div>
    </section>
  );
}
