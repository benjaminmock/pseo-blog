import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] -mt-8 flex items-center">
      {/* Background Image with Enhanced Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-images/hero/hero.webp"
          alt="Yoga-Kurs im Gange"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* to-purple-600/80 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content with Enhanced Typography */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* <span className="inline-block bg-purple-500/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            Verwandle deine Praxis
          </span> */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
            Finde und buche Yoga-Kurse in deiner Nähe
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow">
            Verbinde dich mit zertifizierten Yoga-Lehrern und entdecke Kurse für
            alle Level
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/kurse"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Kurse finden
            </Link>
            <Link
              href="/register?type=teacher"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center border-2 border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Als Lehrer beitreten
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-white/90 text-2xl font-bold mb-1">1000+</div>
              <div className="text-white/80 text-sm">Aktive Schüler</div>
            </div>
            <div className="text-center">
              <div className="text-white/90 text-2xl font-bold mb-1">200+</div>
              <div className="text-white/80 text-sm">Zertifizierte Lehrer</div>
            </div>
            <div className="text-center">
              <div className="text-white/90 text-2xl font-bold mb-1">4.8★</div>
              <div className="text-white/80 text-sm">
                Durchschnittliche Bewertung
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" /> */}
    </section>
  );
}
