import AuthNav from "@/components/AuthNav";
import { icon } from "@/config";

type Props = {
  metadata: {
    title: string;
    description: string;
    icons: { icon: string };
  };
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
};

const Header = ({ metadata, user }: Props) => {
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
              href="/trainer"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Lehrer
            </a>
            <a
              href="/studios"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Studios
            </a>
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
              placeholder="Suchen nach Kursen, Lehrern ..."
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
            <AuthNav user={user} />
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
            placeholder="Suchen nach Kursen, Lehrern ..."
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
