"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/sync/syncService";

function SyncManager({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only start sync if we are fully logged in and have a User ID
    if (status === "authenticated" && session?.user?.id) {
      const cleanup = startBackgroundSync(session.user.id);

      return cleanup;
    }
  }, [session?.user?.id, status]);

  return <>{children}</>;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SyncManager>{children}</SyncManager>
    </SessionProvider>
  );
}
