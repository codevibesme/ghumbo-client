import { cn } from "@/lib/cn";

/** Stops joined by a dotted passport route; the destination dot is stamp red. */
export function RouteLine({ stops, className }: { stops: string[]; className?: string }) {
  return (
    <div role="img" aria-label={`Route: ${stops.join(", ")}`} className={cn("flex flex-wrap items-center gap-y-2 text-ink", className)}>
      {stops.map((stop, i) => {
        const last = i === stops.length - 1;
        return (
          <span key={`${stop}-${i}`} className="contents">
            {i > 0 && (
              <span
                aria-hidden
                className="mx-1.5 min-w-3 max-w-10 flex-[1_1_16px] border-t-[2.5px] border-dotted border-passport"
              />
            )}
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] font-medium uppercase leading-none tracking-[0.04em]">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  last ? "bg-red" : "border-2 border-passport bg-card",
                )}
              />
              {stop}
            </span>
          </span>
        );
      })}
    </div>
  );
}
