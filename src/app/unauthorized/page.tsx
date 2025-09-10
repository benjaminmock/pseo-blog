import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Zugriff verweigert
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
          </p>
          <div className="mt-6 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Zur Startseite
            </Link>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mit anderem Account anmelden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}