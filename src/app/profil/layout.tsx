import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mein Profil",
  description: "Persönliche Profil-Einstellungen",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
