"use client";

import AppNavbar from "@/components/AppNavbar";
import TaskDetailsPanel from "@/lib/context/TaskDetailsPanel";
import { TaskDetailProvider } from "@/lib/context/TaskSidebarContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";

// ✅ Corrected imports (context + panel)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to signin if session missing
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  // Authenticated layout
  if (session) {
    return (
      <TaskDetailProvider>
        <div className="min-h-screen bg-gray-100">
          <AppNavbar />
          <main className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          {/* ✅ Context panel placed here */}
          <TaskDetailsPanel />
        </div>
      </TaskDetailProvider>
    );
  }

  return null;
}
