// next.config.js
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // 👇 THIS IS THE FIX:
    // This tells it to stop looking for the files that are causing the 404 error
    exclude: [
      /_buildManifest\.js$/,
      /_ssgManifest\.js$/,
      /_middlewareManifest\.js$/,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
