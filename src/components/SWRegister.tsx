"use client";
import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    // Check if the browser supports Service Workers
    if ("serviceWorker" in navigator) {
      // Register the file we built
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "✅ Service Worker Registered with scope:",
            registration.scope
          );
        })
        .catch((err) => {
          console.error("❌ Service Worker Registration Failed:", err);
        });
    }
  }, []);

  return null; // This component renders nothing, it just runs logic
}
