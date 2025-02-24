"use client";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Überprüfen Sie Ihre E-Mail
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ein Anmeldelink wurde an Ihre E-Mail-Adresse gesendet. Bitte klicken
            Sie auf den Link in der E-Mail, um sich anzumelden.
          </p>
          <div className="mt-8 text-6xl">📧</div>
          <p className="mt-4 text-sm text-gray-500">
            Der Link ist aus Sicherheitsgründen nur für kurze Zeit gültig.
          </p>
        </div>
      </div>
    </div>
  );
}
