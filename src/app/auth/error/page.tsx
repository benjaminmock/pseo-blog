"use client";

// import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  // const searchParams = useSearchParams();
  // const error = searchParams.get("error");

  const error = "AccessDenied";

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "Es liegt ein Problem mit der Server-Konfiguration vor.";
      case "AccessDenied":
        return "Der Zugriff wurde verweigert.";
      case "Verification":
        return "Der Verifizierungslink ist ungültig oder abgelaufen.";
      default:
        return "Ein unerwarteter Fehler ist aufgetreten.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Authentifizierungsfehler
          </h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage(error)}</p>
          <div className="mt-8 text-6xl">⚠️</div>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
