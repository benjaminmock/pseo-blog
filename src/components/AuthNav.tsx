"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthNavProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function AuthNav({ user }: AuthNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <span className="text-sage-700 text-sm">Willkommen, {user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-earth-600 hover:text-earth-700 transition-colors duration-200"
          >
            Abmelden
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm font-medium text-earth-600 hover:text-earth-700 transition-colors duration-200"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-white bg-earth-600 hover:bg-earth-700 px-5 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-earth-300"
          >
            Registrieren
          </Link>
        </>
      )}
    </div>
  );
}
