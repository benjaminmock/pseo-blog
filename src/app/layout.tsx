import { initConfig, metadata, icon, ConfigModule } from "@/config";
import { getSession } from "@/lib/session";
import AuthNav from "@/components/AuthNav";

import "./globals.css";
import Header from "./_components/header";

let config: ConfigModule | undefined;

async function initializeConfig() {
  if (!config) {
    config = await initConfig();
  }
  return config;
}

export async function generateMetadata() {
  await initializeConfig();
  return {
    title: config?.title || "Yoga Blog",
    description: config?.description || "Ein Blog über Yoga und Wellness",
    icons: { icon: config?.favicon },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initializeConfig();
  const user = await getSession();

  return (
    <html lang="de">
      <body className="antialiased bg-gray-50 text-gray-900 dark:text-gray-200">
        <Header metadata={metadata} user={user} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

// {/* Header */}
// <header className="bg-white shadow border-b">
// <div className="container mx-auto px-4 py-4">
//   <div className="flex justify-between items-center">
//     <a
//       href="/"
//       className="flex items-center text-xl font-semibold text-zinc-800 hover:text-zinc-600 transition"
//     >
//       {icon}
//       {metadata?.title}
//     </a>
//     <AuthNav user={user} />
//   </div>
//   {/* Search Field */}
//   <div className="mt-4">
//     <form action="/suche" method="POST" className="flex items-center">
//       <input
//         type="text"
//         name="query"
//         placeholder="Suche..."
//         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       />
//       <button
//         type="submit"
//         className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       >
//         Suchen
//       </button>
//     </form>
//   </div>
// </div>
// </header>
