import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google Profile Pics
        port: "",
        pathname: "/a/**",
      },
      // ✅ ADD THIS BLOCK FOR AWS S3
      {
        protocol: "https",
        hostname: "**.amazonaws.com", // Allows all AWS S3 regions/buckets
      },
    ],
  },
};

export default withPWA(nextConfig);
