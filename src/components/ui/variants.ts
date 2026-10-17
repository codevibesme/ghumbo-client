import { cn } from "@/lib/cn";

/*
 * Class builders shared by components and by elements that borrow their look
 * (e.g. a <Link> styled as a button). Kept out of the .tsx component files so
 * Fast Refresh can preserve component state.
 */

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* Archivo 700 at 110% stretch, 6px radius, 1.5px border on every      */
/* variant so heights match. L (52px) for page CTAs and forms, M (44px) */
/* in headers, cards, dialogs and filters.                             */
/* ------------------------------------------------------------------ */

const buttonVariants = {
  primary:
    "bg-passport text-on-passport border-passport hover:bg-passport-hover hover:border-passport-hover",
  secondary: "bg-card text-ink border-line hover:bg-stock",
  destructive: "bg-card text-red border-red hover:bg-stock",
  /** Final confirm of a destructive action ("Delete account"). */
  danger: "bg-red-fill text-on-red border-red-fill hover:brightness-110",
  /** Flap-yellow fill for use on the departure board / dark footer. */
  board: "bg-flap text-board border-flap hover:brightness-105",
} as const;

const buttonSizes = {
  l: "h-[52px] px-6 text-[16px]",
  m: "h-11 px-[18px] text-[15px]",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonClasses({
  variant = "primary",
  size = "l",
  fullWidth,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-ticket border-[1.5px]",
    "font-sans font-bold leading-none [font-stretch:110%] no-underline transition-colors",
    "disabled:cursor-not-allowed disabled:border-rule disabled:bg-rule disabled:text-muted disabled:hover:brightness-100",
    "aria-disabled:pointer-events-none aria-disabled:border-rule aria-disabled:bg-rule aria-disabled:text-muted",
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth && "w-full",
    className,
  );
}

/* ------------------------------------------------------------------ */
/* Tertiary text link · mono 13 caps, underlined, 44px hit area        */
/* ------------------------------------------------------------------ */

export function textLinkClasses({ tone = "default" }: { tone?: "default" | "board" } = {}) {
  return cn(
    "inline-flex min-h-11 items-center font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em]",
    "underline decoration-[1.5px] underline-offset-4 transition-colors",
    tone === "board" ? "text-flap hover:text-on-board" : "text-link hover:text-red",
  );
}

/* ------------------------------------------------------------------ */
/* Radio cards · selected = 2.5px passport outline. Pair the border     */
/* swap with a padding swap so content doesn't shift.                  */
/* ------------------------------------------------------------------ */

export const radioCardClasses = cn(
  "w-full cursor-pointer rounded-ticket border-[1.5px] border-line bg-card text-left text-ink",
  "data-[state=checked]:border-[2.5px] data-[state=checked]:border-passport",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

/* ------------------------------------------------------------------ */
/* Form controls · 52px, 1.5px ink, 6px radius, white, Archivo 16;    */
/* error swaps to a 2px stamp-red border via aria-invalid.            */
/* ------------------------------------------------------------------ */

export const controlClasses = cn(
  "h-[52px] w-full rounded-ticket border-[1.5px] border-line bg-card px-4",
  "font-sans text-[16px] leading-[1.2] text-ink placeholder:text-placeholder",
  "aria-invalid:border-2 aria-invalid:border-red",
  "disabled:cursor-not-allowed disabled:bg-sunk disabled:text-muted",
);
