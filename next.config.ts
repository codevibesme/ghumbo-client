import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  images: {
    // Catalog photos: our CDN (CC-licensed Commons photos are mirrored there, credits kept in the asset).
    // Profile photos: Google's, saved on sign-up with Google.
    remotePatterns: [
      new URL("https://cdn.ghumbo.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
  partialPrefetching: true,
  // Sign-in, OTP and account pages can't be framed (clickjacking).
  async headers() {
    const noFraming = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    ];
    return ["/sign-in", "/verify", "/profile"].map((source) => ({ source, headers: noFraming }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
