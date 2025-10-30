// src/app/app/layout.tsx
"use client";

import AppNavbar from "@/components/AppNavbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // This is the auth protection
    if (status === "loading") return; // Wait until session is loaded
    if (!session) {
      // If no session, redirect to sign-in
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Show a loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  // If authenticated, show the app layout
  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar /> {/* Your new "extraordinary" navbar */}
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Fallback for unauthenticated state (should be covered by redirect)
  return null;
}
