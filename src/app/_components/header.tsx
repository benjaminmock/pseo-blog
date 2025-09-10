"use client";

import AuthNav from "@/components/AuthNav";
import UserSubNav from "@/components/UserSubNav";
import { useSession } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  return (
    <header className="bg-white shadow border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <a
            href="/"
            className="flex items-center text-xl font-semibold text-zinc-800 hover:text-zinc-600 transition"
          >
            <span className="mr-4 md:mr-10">kursio.de</span>
          </a>

          {/* Mobile Menu Toggle */}
          <label htmlFor="mobile-menu" className="md:hidden cursor-pointer">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a
              href="/kurse"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Kurse
            </a>
            <a
              href="/events"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Events
            </a>
            <a
              href="/trainer"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Lehrer
            </a>
            {/* <a
              href="/studios"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Studios
            </a> */}
          </nav>

          {/* Search Field */}
          <form
            action="/suche"
            method="GET"
            className="hidden md:flex items-center flex-1 mx-6 max-w-xl"
          >
            <input
              type="text"
              name="query"
              placeholder="Suchen nach Kursen, Events, Städten ..."
              className="flex-1 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 placeholder-gray-500 text-gray-600"
              minLength={2}
              required
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 text-gray-900 hover:text-gray-700 focus:outline-none"
              aria-label="Suchen"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center">
            <AuthNav />
          </div>
        </div>

        {/* Mobile Search - Always visible */}
        <form
          action="/suche"
          method="GET"
          className="mt-4 md:hidden flex items-center w-full"
        >
          <input
            type="text"
            name="query"
            placeholder="Suchen nach Kursen, Events, Städten ..."
            className="flex-1 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 placeholder-gray-500 text-gray-600"
            minLength={2}
            required
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 text-gray-900 hover:text-gray-700 focus:outline-none"
            aria-label="Suchen"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile Menu - Hidden by default */}
      <input type="checkbox" id="mobile-menu" className="hidden peer" />

      {/* Mobile Menu Overlay - Lower z-index */}
      <label
        htmlFor="mobile-menu"
        className="fixed inset-0 bg-black bg-opacity-50 hidden peer-checked:block md:hidden cursor-pointer z-40"
      ></label>

      {/* Mobile Menu - Higher z-index */}
      <div className="fixed inset-y-0 left-0 transform -translate-x-full peer-checked:translate-x-0 w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out md:hidden z-50">
        <div className="p-6">
          <nav className="space-y-4">
            <a
              href="/kurse"
              className="block text-gray-700 hover:text-gray-900 transition"
            >
              Kurse
            </a>
            <a
              href="/events"
              className="block text-gray-700 hover:text-gray-900 transition"
            >
              Events
            </a>
            <a
              href="/trainer"
              className="block text-gray-700 hover:text-gray-900 transition"
            >
              Lehrer
            </a>
            <a
              href="/studios"
              className="block text-gray-700 hover:text-gray-900 transition"
            >
              Studios
            </a>

            {/* User Actions Section for Mobile */}
            {session?.user && (
              <>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="text-sm font-medium text-gray-500 mb-3">
                    Benutzer-Aktionen
                  </div>
                  <a
                    href="/profil"
                    className="block text-gray-700 hover:text-gray-900 transition flex items-center space-x-2"
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
                    <span>Profil bearbeiten</span>
                  </a>
                  <a
                    href="/kurs/neu"
                    className="block text-gray-700 hover:text-gray-900 transition flex items-center space-x-2 mt-3"
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
                  </a>
                  <a
                    href="/event/neu"
                    className="block text-gray-700 hover:text-gray-900 transition flex items-center space-x-2 mt-3"
                    data-testid="create-event-link-mobile"
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
                  </a>
                  <a
                    href={
                      session.user.role === "teacher"
                        ? "/anbieter-dashboard"
                        : "/student-dashboard"
                    }
                    className="block text-gray-700 hover:text-gray-900 transition flex items-center space-x-2 mt-3"
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
                  </a>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* User Sub Navigation - appears below main header */}
      <UserSubNav />
    </header>
  );
};

export default Header;
