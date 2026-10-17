import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // Tour photos: our CDN, plus Wikimedia Commons for the seeded CC-licensed photos.
    remotePatterns: [
      new URL("https://cdn.ghumbo.com/**"),
      new URL("https://upload.wikimedia.org/wikipedia/commons/**"),
      new URL("https://thumb.wikimedia.org/wikipedia/commons/**"),
    ],
  },
  partialPrefetching: true,
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
