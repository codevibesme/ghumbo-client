import type { NextConfig } from "next";
import { AI_BOTS, NEXT_DEFAULT_HTML_LIMITED_BOTS } from "./src/config/seo-bots";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  // AI answer engines don't run JS and read <head> only: give them blocking
  // metadata like Google and Bing get (docs/seo-geo-guidelines.md §1).
  htmlLimitedBots: new RegExp(`${NEXT_DEFAULT_HTML_LIMITED_BOTS}|${AI_BOTS.join("|")}`, "i"),
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
