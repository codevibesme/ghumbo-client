import { useSyncExternalStore } from "react";
import { THEME_COOKIE } from "./theme-cookie";

export type ThemeChoice = "system" | "light" | "dark";

const EVENT = "ghumbo-theme-change";

function read(): ThemeChoice {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : "system";
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Apply a theme now and remember it for a year ("system" clears the cookie). */
export function setTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    root.setAttribute("data-theme", choice);
    document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=31536000; samesite=lax`;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useTheme() {
  return useSyncExternalStore(subscribe, read, () => "system" as const);
}
