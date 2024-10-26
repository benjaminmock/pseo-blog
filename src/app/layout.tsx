import type { Metadata } from "next";
import { metadata as configMetadata, icon } from "@/config";

import "./globals.css";

export const metadata: Metadata = {
  title: configMetadata.titleTag,
  description: configMetadata.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`antialiased bg-white text-gray-900  dark:text-gray-700`}
      >
        <header className="text-black py-4 bg-gray-50 border-b mb-8">
          <nav className="container mx-auto flex justify-between items-center">
            <a
              href="/"
              className="flex items-center space-x-2 text-2xl font-bold"
            >
              {icon}
              {configMetadata.title}
            </a>
            {/*
            <div className="hidden md:flex space-x-6">
              <a href="/about" className="hover:underline">
                About
              </a>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </div>
            <div className="md:hidden">
              <input type="checkbox" id="menu-toggle" className="hidden" />
              <label htmlFor="menu-toggle" className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </label>

              <div
                className="hidden flex-col space-y-4 px-6 py-4 bg-gray-700 text-white"
                id="mobile-menu"
              >
                <a href="/about" className="hover:underline">
                  About
                </a>
                <a href="/contact" className="hover:underline">
                  Contact
                </a>
              </div>
            </div>
  */}
          </nav>
        </header>

        {/* Main content */}
        <main className="container mx-auto p-4 min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="text-black py-4 bg-gray-50 border-t">
          <div className="container mx-auto flex justify-between items-center mx-auto px-5">
            <p>
              &copy; {new Date().getFullYear()} {configMetadata.title}
            </p>
            <div>
              {/* <a href="/privacy" className="mr-6 hover:underline">
                Privacy Policy
              </a> */}
              <a href="/impressum" className="hover:underline">
                Impressum
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
