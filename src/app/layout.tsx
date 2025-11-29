import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import LayoutClient from "./layout-client";
import SWRegister from "@/components/SWRegister"; // Verify this path is correct

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskGlyph",
  description: "Offline-first productivity for knowledge workers",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-900`}>
        {/* ✅ Fix: Wrap everything in LayoutClient so the provider is at the top */}
        <LayoutClient>
          <SWRegister /> {/* ✅ Now this is INSIDE the provider */}
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
