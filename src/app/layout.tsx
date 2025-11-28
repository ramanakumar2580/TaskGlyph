import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
// Import LayoutClient here so it's available
import LayoutClient from "./layout-client";
import SWRegister from "@/components/SWRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskGlyph",
  description: "Offline-first productivity for knowledge workers",
  manifest: "/manifest.json", // 👈 ADD THIS LINE HERE
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ✅ (Point 1) Added a clean background color to the whole page */}
      <body className={`${inter.className} bg-gray-100 text-gray-900`}>
        <SWRegister />
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
