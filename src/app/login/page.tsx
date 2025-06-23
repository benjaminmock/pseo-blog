"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "teacher">("student");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Store the selected role in localStorage before initiating the OAuth flow
      localStorage.setItem("selectedUserRole", userRole);

      await signIn("google", {
        callbackUrl: "/intern", // Redirect to intern page after login
      });
    } catch {
      setError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Store the selected role in localStorage before initiating the OAuth flow
      localStorage.setItem("selectedUserRole", userRole);

      await signIn("linkedin", {
        callbackUrl: "/intern", // Redirect to intern page after login
      });
    } catch {
      setError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      // Store the selected role in localStorage before initiating the email sign-in
      localStorage.setItem("selectedUserRole", userRole);

      const result = await signIn("email", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Ungültige E-Mail-Adresse. Bitte überprüfen Sie Ihre Eingabe."
        );
      } else {
        setEmailSent(true);
      }
    } catch {
      setError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              E-Mail gesendet!
            </h2>
            <p className="text-gray-600">
              Wir haben Ihnen einen Anmeldelink an Ihre E-Mail-Adresse
              geschickt. Bitte überprüfen Sie Ihren Posteingang und klicken Sie
              auf den Link, um sich anzumelden.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Willkommen zurück!
          </h2>
          <div className="text-6xl mt-4">🧘‍♀️</div>
        </div>
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Anmelden</h2>
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-100 border border-red-300 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* User Role Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ich bin ein:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userRole"
                    value="student"
                    checked={userRole === "student"}
                    onChange={() => setUserRole("student")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userRole"
                    value="teacher"
                    checked={userRole === "teacher"}
                    onChange={() => setUserRole("teacher")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Lehrer</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700">
                {isLoading ? "Wird angemeldet..." : "Mit Google anmelden"}
              </span>
            </button>

            <button
              onClick={handleLinkedInSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-[#0077B5] text-white p-3 rounded-lg hover:bg-[#006399] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0077B5]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>
                {isLoading ? "Wird angemeldet..." : "Mit LinkedIn anmelden"}
              </span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">oder</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E-Mail-Adresse"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? "Wird gesendet..." : "Mit E-Mail anmelden"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Neu hier?</span>
              </div>
            </div>
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Registrieren Sie sich für ein neues Konto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
