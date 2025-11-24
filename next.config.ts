import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ [FIX] Add this block
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**", // Allows all Google user profile images
      },
    ],
  },
};

export default nextConfig;
