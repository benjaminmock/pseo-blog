"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserSubNav() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 hidden md:block">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-6">
          <Link
            href="/intern"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center space-x-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 1v6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 1v6"
              />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/profil"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center space-x-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Profil</span>
          </Link>

          <Link
            href="/kurs/neu"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center space-x-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Kurs erstellen</span>
          </Link>

          <Link
            href="/event/neu"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center space-x-1"
            data-testid="create-event-link-desktop"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Event erstellen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
