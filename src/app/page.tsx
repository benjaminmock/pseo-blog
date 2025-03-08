import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import WhyYogaSection from "@/components/home/WhyYogaSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export const metadata: Metadata = {
  title: "Yoga-Kurse in deiner Nähe finden und buchen | YogaConnect",
  description:
    "Verbinde dich mit zertifizierten Yoga-Lehrern und entdecke Kurse für alle Level. Buche Yoga-Kurse online und starte deine Wellness-Reise heute.",
  keywords:
    "yoga kurse, yoga lehrer, yoga buchen, yoga in der nähe, yoga unterricht, yoga lehren",
};

export default function HomePage() {
  return (
    <div className="space-y-16 -mt-8">
      <HeroSection />

      <SearchSection />

      {/* Benefits Sections */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          <BenefitsSection
            title="Für Schüler"
            benefits={[
              {
                title: "Große Auswahl",
                description:
                  "Zugang zu hunderten von Yoga-Kursen für alle Level",
              },
              {
                title: "Geprüfte Lehrer",
                description:
                  "Lerne von zertifizierten Lehrern mit echten Bewertungen",
              },
              {
                title: "Flexible Buchung",
                description: "Buche Kurse einfach mit sicherer Bezahlung",
              },
            ]}
          />
          <BenefitsSection
            title="Für Lehrer"
            benefits={[
              {
                title: "Geschäft ausbauen",
                description:
                  "Erreiche mehr Schüler und erweitere deine Präsenz",
              },
              {
                title: "100% Verdienst",
                description: "Keine Plattform-Gebühren - du behältst alles",
              },
              {
                title: "Einfache Verwaltung",
                description: "Praktische Tools für Kurs- und Schülermanagement",
              },
            ]}
          />
        </div>
      </section>

      {/* <FeaturedSection /> */}

      <WhyYogaSection />

      <TestimonialsSection />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit, deine Yoga-Reise zu beginnen?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Kurse finden
            </button>
            <button className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors">
              Als Lehrer registrieren
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
