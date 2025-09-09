import Link from "next/link";

export default function LoginGuidePage() {
  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Willkommen bei kursio.de</h1>
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <p className="text-lg text-gray-600">
              Wählen Sie Ihre Anmeldeoption basierend auf Ihrer Rolle
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Teacher/Provider Login */}
            <div className="border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">👨‍🏫</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Kursanbieter</h2>
                <p className="text-gray-600 mb-4">
                  Sie möchten Kurse erstellen und verwalten? Dann sind Sie ein Anbieter.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Als Anbieter können Sie:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Neue Kurse erstellen und veröffentlichen</li>
                  <li>• Kursinhalte und Termine verwalten</li>
                  <li>• Teilnehmer verwalten und kommunizieren</li>
                  <li>• Zahlungen und Buchungen überwachen</li>
                </ul>
              </div>

              <Link
                href="/login/anbieter"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Als Anbieter anmelden
              </Link>
            </div>

            {/* Student/Participant Login */}
            <div className="border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🧘‍♀️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Kursteilnehmer</h2>
                <p className="text-gray-600 mb-4">
                  Sie möchten an Kursen teilnehmen? Dann sind Sie ein Teilnehmer.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-900 mb-2">Als Teilnehmer können Sie:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Kurse durchsuchen und buchen</li>
                  <li>• An gebuchten Kursen teilnehmen</li>
                  <li>• Ihren Kursfortschritt verfolgen</li>
                  <li>• Mit anderen Teilnehmern interagieren</li>
                </ul>
              </div>

              <Link
                href="/login/teilnehmer"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Als Teilnehmer anmelden
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Nicht sicher, welche Rolle Sie haben?</strong><br />
                Wenn Sie Kurse anbieten oder unterrichten möchten, wählen Sie "Anbieter".<br />
                Wenn Sie an Kursen teilnehmen möchten, wählen Sie "Teilnehmer".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}