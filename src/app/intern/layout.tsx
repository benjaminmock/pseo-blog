import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interner Bereich",
  description: "Geschützter Bereich für eingeloggte Benutzer",
};

export default function InternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
