import type { Metadata } from "next";
import { Kicker } from "@/components/ui/section-header";
import { ProfileDetails } from "./_components/profile-details";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

// Placeholder until the profile screen is designed: shows who's signed in and offers sign out.
export default function ProfilePage() {
  return (
    <main className="page-container flex flex-1 flex-col gap-6 py-12 md:py-20">
      <Kicker>Account</Kicker>
      <h1 className="m-0 type-h1">Your account</h1>
      <ProfileDetails />
    </main>
  );
}
