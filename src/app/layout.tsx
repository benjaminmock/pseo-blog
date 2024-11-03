import { useEffect } from "react";
import type { Metadata } from "next";
import { initConfig, metadata, icon } from "@/config";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata, icon } = await initConfig();

  return {
    title: metadata?.titleTag,
    description: metadata?.description,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased bg-gray-50 text-gray-900 dark:text-gray-200">
        {/* Header */}
        <header className="bg-white shadow border-b">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a
              href="/"
              className="flex items-center text-xl font-semibold text-zinc-800 hover:text-zinc-600 transition"
            >
              {icon}
              {metadata?.title}
            </a>
          </nav>
        </header>

        <main className="container mx-auto p-6 min-h-screen">{children}</main>

        <footer className="bg-white shadow border-t py-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 text-sm text-gray-600">
            <p className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {metadata?.title}
            </p>
            <div>
              <a href="/impressum" className="hover:text-gray-800 transition">
                Impressum
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
