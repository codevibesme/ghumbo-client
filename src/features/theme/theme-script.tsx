import { THEME_COOKIE } from "./theme-cookie";

/**
 * Runs before first paint: applies an explicit light/dark choice from the cookie
 * so there is no flash. No cookie = follow the OS (handled purely in CSS).
 */
const script = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1]);}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
