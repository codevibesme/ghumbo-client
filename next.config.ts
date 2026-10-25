import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // Tour photos: our CDN, plus Wikimedia Commons for the seeded CC-licensed photos.
    // Profile photos: Google's, saved on sign-up with Google.
    remotePatterns: [
      new URL("https://cdn.ghumbo.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
      new URL("https://upload.wikimedia.org/wikipedia/commons/**"),
      new URL("https://thumb.wikimedia.org/wikipedia/commons/**"),
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
