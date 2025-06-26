import { initConfig, metadata, favicon, ConfigModule } from "@/config";
import { Providers } from "./_components/Providers";

import "./globals.css";
import Header from "./_components/header";
import Footer from "./_components/footer";

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
    title:
      metadata?.title ||
      "Yoga-Kurse in deiner Nähe finden und buchen | YogaConnect",
    description:
      metadata?.description ||
      "Verbinde dich mit zertifizierten Yoga-Lehrern und entdecke Kurse für alle Level. Buche Yoga-Kurse online und starte deine Wellness-Reise heute.",
    keywords:
      "yoga kurse, yoga lehrer, yoga buchen, yoga in der nähe, yoga unterricht, yoga lehren",
    icons: { icon: favicon },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initializeConfig();

  return (
    <html lang="de">
      <body className="antialiased bg-gray-50 text-gray-900 dark:text-gray-200 min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
