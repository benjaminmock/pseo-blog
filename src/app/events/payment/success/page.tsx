import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zahlung erfolgreich!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Ihre Anmeldung wurde bestätigt. Sie erhalten eine Bestätigungs-E-Mail mit allen Details.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/events"
              className="inline-block w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-center"
            >
              Zurück zu den Events
            </Link>
            
            <Link
              href="/"
              className="inline-block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors text-center"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}