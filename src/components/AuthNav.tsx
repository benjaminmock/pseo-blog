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
          <span className="text-gray-700">
            Willkommen, {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Abmelden
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md"
          >
            Registrieren
          </Link>
        </>
      )}
    </div>
  );
}
