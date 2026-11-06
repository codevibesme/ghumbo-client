import type { Metadata } from "next";
import { ProfileDetails } from "./_components/profile-details";

export const metadata: Metadata = {
  title: "Profile & settings",
  robots: { index: false, follow: false },
};

// T14 Profile & settings. Signed-in only; the user comes from the session.
export default function ProfilePage() {
  return (
    <main className="page-container flex flex-1 flex-col gap-4 pt-6 pb-10 md:gap-8 md:pt-12 md:pb-24">
      <ProfileDetails />
    </main>
  );
}
