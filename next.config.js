import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  // 👇 ADD THIS BLOCK. This is the fix.
  // We use "buildExcludes" to stop Next.js from even sending these files to the PWA plugin.
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
  ],

  workboxOptions: {
    disableDevLogs: true,
    // Keep this as a backup safety net
    exclude: [
      /middleware-manifest\.json$/,
      /_buildManifest\.js$/,
      /_ssgManifest\.js$/,
    ],
  },
});

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
