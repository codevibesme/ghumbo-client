import { useMemo, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/**
 * A JSON value from sessionStorage, read without a hydration mismatch:
 * `undefined` while prerendering/hydrating, then the value or `null` if absent.
 */
export function useSessionStorageJson<T>(key: string): T | null | undefined {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => undefined,
  );

  return useMemo(() => {
    if (raw === undefined || raw === null) return raw;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}
