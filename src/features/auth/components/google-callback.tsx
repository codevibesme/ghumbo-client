"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { loadUser, takeNextAfterGoogle } from "../session";

/** Landing after Google: the backend has set the session cookies. Load the user, then continue. */
export function GoogleCallback() {
  const router = useRouter();
  // takeNextAfterGoogle() consumes the stored path, so run once even under StrictMode.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const next = takeNextAfterGoogle();
    // Waits on loadUser(): there's no event to hang it on, and no server-side session to redirect() from.
    // react-doctor-disable-next-line react-doctor/nextjs-no-client-side-redirect
    loadUser().then(() => router.replace(next));
  }, [router]);

  return <p className="m-0 type-body text-muted">Signing you in…</p>;
}
