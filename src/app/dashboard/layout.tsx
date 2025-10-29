"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LayoutClient from "@/app/layout-client";
// ❌ REMOVED: import { startBackgroundSync } from "@/lib/sync/syncService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // ❌ REMOVED: The useEffect for startBackgroundSync
  // We will add this to layout-client.tsx

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If authenticated, show dashboard with top bar
  return (
    <LayoutClient>
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold text-gray-900">TaskGlyph</h1>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </LayoutClient>
  );
}
