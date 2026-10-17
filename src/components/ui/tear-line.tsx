import { cn } from "@/lib/cn";

/*
 * Tear line + notches. Tear: 2px dashed, edge to edge inside the card.
 * Notch: 20px circle filled with the surface BEHIND the card, centred on the
 * card's outer border (−11.5px), with a 1.5px ink arc on the inner half only.
 * The card must not use overflow: hidden. Leave ≥ 24px between cards.
 */

type TearLineProps = {
  orientation?: "horizontal" | "vertical";
  /** Draw the two notches. Off for tears inside emails or flat panels. */
  notches?: boolean;
  /** Colour of the surface behind the card (fills the notch). */
  ground?: string;
  className?: string;
};

const notch =
  "absolute size-5 rounded-full border-[1.5px] border-transparent";

export function TearLine({
  orientation = "horizontal",
  notches = true,
  ground = "var(--g-stock)",
  className,
}: TearLineProps) {
  if (orientation === "vertical") {
    return (
      <div
        aria-hidden
        className={cn("relative w-0 shrink-0 border-l-2 border-dashed border-tear", className)}
      >
        {notches && (
          <>
            <span
              className={cn(notch, "-left-[11px] -top-[11.5px] rotate-45 border-r-line border-b-line")}
              style={{ background: ground }}
            />
            <span
              className={cn(notch, "-bottom-[11.5px] -left-[11px] rotate-45 border-l-line border-t-line")}
              style={{ background: ground }}
            />
          </>
        )}
      </div>
    );
  }
  return (
    <div aria-hidden className={cn("relative h-0 border-t-2 border-dashed border-tear", className)}>
      {notches && (
        <>
          <span
            className={cn(notch, "-left-[11.5px] -top-[11px] -rotate-45 border-r-line border-b-line")}
            style={{ background: ground }}
          />
          <span
            className={cn(notch, "-right-[11.5px] -top-[11px] rotate-45 border-l-line border-b-line")}
            style={{ background: ground }}
          />
        </>
      )}
    </div>
  );
}
