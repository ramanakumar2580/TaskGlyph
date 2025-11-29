"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { startBackgroundSync } from "@/lib/sync/syncService";

export default function SWRegister() {
  const { data: session } = useSession();

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("✅ SW Registered", reg.scope))
        .catch((err) => console.error("❌ SW Failed", err));
    }
  }, []);

  // ✅ Start Sync ONLY when user is logged in
  useEffect(() => {
    if (session?.user?.id) {
      // Pass the User ID so we can protect the data!
      const cleanup = startBackgroundSync(session.user.id);
      return cleanup;
    }
  }, [session?.user?.id]); // Re-run if user changes

  return null;
}
