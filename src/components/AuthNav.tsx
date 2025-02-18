"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import RegisterModal from "@/app/_components/register";

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
          <span className="text-gray-700 text-sm">Willkommen, {user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-800 hover:text-slate-600 transition-colors duration-200"
          >
            Abmelden
          </button>
        </>
      ) : (
        <>
          <Link
            href="/register"
            className="px-4 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Registrieren
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Einloggen
          </Link>
        </>
      )}
      {/* <RegisterModal isOpen={true} onClose={() => {}} /> */}
    </div>
  );
}
