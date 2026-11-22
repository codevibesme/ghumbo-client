import { redirect } from "next/navigation";
import { useSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";

/**
 * Signed-in pages: the user once the session loads, `null` while it loads.
 * Signed-out visitors go to /sign-in and come back to `next`.
 */
export function useSignedInUser(next: string): User | null {
  const { status, user } = useSession();
  if (status === "signed-out") redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}
