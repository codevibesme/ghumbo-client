import type { Metadata } from "next";
import { GoogleCallback } from "@/features/auth/components/google-callback";

export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false, follow: false },
};

// The backend's Google callback redirects here after setting the session cookies.
export default function AuthCallbackPage() {
  return <GoogleCallback />;
}
