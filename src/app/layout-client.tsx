"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/sync/syncService";

// We create a new component that *contains* the sync logic
// because we can only call useSession() inside a <SessionProvider>.
function SyncManager({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // ✅ ADDED: Start background sync for authenticated users
  useEffect(() => {
    if (session?.user?.id) {
      console.log("Starting global background sync...");
      const cleanup = startBackgroundSync(session.user.id);
      return cleanup; // Clean up event listener on unmount
    }
  }, [session?.user?.id]);

  return <>{children}</>;
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* ✅ WRAPPED: We wrap the children in our new SyncManager */}
      <SyncManager>{children}</SyncManager>
    </SessionProvider>
  );
}
