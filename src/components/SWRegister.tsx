// src/components/SWRegister.tsx
"use client";
import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      window.addEventListener("load", async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          console.log("SW registered at", reg.scope);

          // listen for updates etc
          reg.addEventListener("updatefound", () => {
            console.log("SW update found");
          });
        } catch (err) {
          console.error("SW registration failed:", err);
        }
      });
    }
  }, []);

  return null;
}
