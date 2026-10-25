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
    loadUser().then(() => router.replace(next));
  }, [router]);

  return <p className="m-0 type-body text-muted">Signing you in…</p>;
}
