import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Today as `YYYY-MM-DD` in the browser, `undefined` while prerendering/hydrating,
 * so a build-time date never ends up in the HTML.
 */
export function useToday(): string | undefined {
  return useSyncExternalStore(
    subscribe,
    () => new Date().toISOString().slice(0, 10),
    () => undefined,
  );
}
