import { cn } from "@/lib/cn";

/*
 * The route-loop logo: the g's tail is a dotted route with a stop, a loop and a
 * pin at the destination. Pin is stamp red on light grounds, coral on dark.
 * Minimum 104px wide. Never stretch, rotate, outline, recolour or set in caps.
 * In sentences write "Ghumbo"; the lowercase form belongs to the logo only.
 */

type LogoProps = {
  /** "ink" follows the theme (ink strokes on stock/white). "stock" is for the
   *  board, navy or photos: light strokes + coral pin. */
  tone?: "ink" | "stock";
  /** Fill of the small stop circle; match the ground the logo sits on. */
  ground?: string;
  className?: string;
};

export function Logo({ tone = "ink", ground, className }: LogoProps) {
  const stroke = tone === "ink" ? "var(--g-ink)" : "var(--g-on-board)";
  const pin = tone === "ink" ? "var(--g-red)" : "var(--g-coral)";
  const stop = ground ?? (tone === "ink" ? "var(--g-stock)" : "var(--g-board)");
  return (
    <svg viewBox="0 0 450 140" aria-hidden className={cn("h-auto w-40", className)}>
      <circle cx="46" cy="46" r="24" fill="none" stroke={stroke} strokeWidth="13" />
      <path d="M70 26 V80" fill="none" stroke={stroke} strokeWidth="13" strokeLinecap="round" />
      <path
        d="M70 80 C70 112 42 120 28 106 C16 93 30 78 44 87 C56 95 52 112 38 122"
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      <circle cx="70" cy="80" r="7" fill={stop} stroke={stroke} strokeWidth="4" />
      <circle cx="36" cy="124" r="10" fill={pin} />
      <text
        x="88"
        y="70"
        fill={stroke}
        fontSize="86"
        fontWeight="800"
        letterSpacing="-2"
        style={{ fontFamily: "var(--font-archivo), sans-serif", fontStretch: "118%" }}
      >
        humbo
      </text>
    </svg>
  );
}

/** The mark alone (app icon). Under 32px use the bowl + pin only (see app/icon.svg). */
export function LogoMark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "stock" }) {
  const stroke = tone === "ink" ? "var(--g-ink)" : "var(--g-on-board)";
  const pin = tone === "ink" ? "var(--g-red)" : "var(--g-coral)";
  return (
    <svg viewBox="0 0 100 140" aria-hidden className={cn("h-auto w-11", className)}>
      <circle cx="46" cy="46" r="24" fill="none" stroke={stroke} strokeWidth="14" />
      <path d="M70 26 V80" stroke={stroke} strokeWidth="14" strokeLinecap="round" />
      <path
        d="M70 80 C70 112 42 120 28 106 C16 93 30 78 44 87 C56 95 52 112 38 122"
        fill="none"
        stroke={stroke}
        strokeWidth="7"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <circle cx="36" cy="124" r="11" fill={pin} />
    </svg>
  );
}
