import AuthNav from "@/components/AuthNav";
import { icon } from "@/config";

type Props = {
  metadata: {
    title: string;
    description: string;
    icons: { icon: string };
  };
  user: {};
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
            {icon}
            <span className="ml-2">{metadata?.title}</span>
          </a>

          {/* Search Field */}
          <form
            action="/suche"
            method="POST"
            className="flex items-center flex-1 mx-6 max-w-xl"
          >
            <input
              type="text"
              name="query"
              placeholder="Suche..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 border border-indigo-500 text-indigo-500 bg-white rounded-r-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Suchen
            </button>
          </form>

          <AuthNav user={user} />

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <a
              href="/launches"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Launches
            </a>
            <a
              href="/products"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Products
            </a>
            <a
              href="/news"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              News
            </a>
            <a
              href="/community"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Community
            </a>
            <a
              href="/advertise"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Advertise
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <a
              href="/subscribe"
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Subscribe
            </a>
            <a
              href="/signin"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
