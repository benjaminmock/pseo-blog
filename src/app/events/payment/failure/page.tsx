import Link from 'next/link';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zahlung fehlgeschlagen
          </h1>
          
          <p className="text-gray-600 mb-6">
            Ihre Zahlung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut oder wenden Sie sich an uns.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="inline-block w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-center"
            >
              Erneut versuchen
            </button>
            
            <Link
              href="/events"
              className="inline-block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors text-center"
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
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Bei Problemen kontaktieren Sie uns unter{' '}
              <a 
                href="mailto:support@example.com" 
                className="text-black hover:underline"
              >
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}