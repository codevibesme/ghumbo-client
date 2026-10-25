"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "../api";
import { markSignedOut } from "../session";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    // The backend always clears its cookies; sign out here even if the call fails.
    await signOut().catch(() => {});
    markSignedOut();
    router.push("/");
  }

  return (
    <Button type="button" variant="destructive" disabled={pending} onClick={onClick} className={className}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
