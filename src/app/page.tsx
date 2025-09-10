"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import WhyYogaSection from "@/components/home/WhyYogaSection";

interface Course {
  course_id: number;
  course_name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  city_slug: string | null;
  slug: string | null;
  active: number;
  first_name: string;
  last_name: string;
}

interface Event {
  event_id: number;
  event_name: string;
  description: string;
  start_date: string;
  start_time: string | null;
  city_slug: string | null;
  slug: string | null;
  active: number;
  max_participants: number | null;
  price: number | null;
  first_name: string;
  last_name: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if there's a stored role in localStorage
      const storedRole = localStorage.getItem("selectedUserRole");

      if (storedRole && session.user.role !== storedRole) {
        // Update the user's role in the database
        updateUserRole(storedRole);
      }

      // Clear the stored role
      localStorage.removeItem("selectedUserRole");

      // Redirect users to their role-specific dashboard
      if (session.user.role === "teacher") {
        window.location.href = "/anbieter-dashboard";
      } else if (session.user.role === "student") {
        window.location.href = "/student-dashboard";
      }
    }
  }, [status, session]);

  const updateUserRole = async (role: string) => {
    try {
      // Call an API endpoint to update the user's role
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        // After updating role, redirect to appropriate dashboard
        if (role === "teacher") {
          window.location.href = "/anbieter-dashboard";
        } else if (role === "student") {
          window.location.href = "/student-dashboard";
        }
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  // Only show redirect message if we're actually redirecting
  if (status === "authenticated" && localStorage.getItem("selectedUserRole")) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">
            Sie werden zu Ihrem Dashboard weitergeleitet...
          </p>
        </div>
      </div>
    );
  }

  // Show original homepage for unauthenticated users
  return (
    <div className="space-y-16 -mt-8">
      <HeroSection />

      <SearchSection />

      {/* Benefits Sections */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          <BenefitsSection
            title="Für Yoga Schüler*innne"
            benefits={[
              {
                title: "Große Auswahl",
                description:
                  "Zugang zu hunderten von Yoga-Kursen für alle Level",
              },
              {
                title: "Geprüfte Lehrer",
                description:
                  "Lerne von zertifizierten Lehrern mit echten Bewertungen",
              },
              // {
              //   title: "Flexible Buchung",
              //   description: "Buche Kurse einfach mit sicherer Bezahlung",
              // },
            ]}
          />
          <BenefitsSection
            title="Für Yoga Lehrer*innen"
            benefits={[
              {
                title: "Geschäft ausbauen",
                description:
                  "Erreiche mehr Schüler und erweitere deine Präsenz",
              },
              {
                title: "100% Verdienst",
                description: "Keine Plattform-Gebühren - du behältst alles",
              },
              {
                title: "Einfache Verwaltung (coming soon)",
                description: "Praktische Tools für Kurs- und Schülermanagement",
              },
            ]}
          />
        </div>
      </section>

      {/* <FeaturedSection /> */}

      <WhyYogaSection />

      {/* <TestimonialsSection /> */}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit, deine Yoga-Reise zu beginnen?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Kurse finden
            </button>
            <button className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors">
              Als Lehrer registrieren
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
