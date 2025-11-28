import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // 👇 UPDATED: Stronger filter that catches ANY file with these names
    exclude: [
      /middleware-manifest\.json$/,
      /build-manifest\.json$/,
      /.*_buildManifest\.js$/, // 👈 Added ".*" to match any path
      /.*_middlewareManifest\.js$/,
      /.*_ssgManifest\.js$/,
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
