import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** "Included" (green checks) or "Not included" (muted crosses). */
export function InclusionList({
  title,
  kind,
  items,
  className,
}: {
  title: ReactNode;
  kind: "included" | "excluded";
  items: { title: string; note?: string }[];
  className?: string;
}) {
  const Icon = kind === "included" ? Check : X;
  return (
    <div className={className}>
      <h3 className="m-0 mb-1 type-h4">{title}</h3>
      <ul className="m-0 list-none p-0">
        {items.map((item) => (
          <li key={item.title} className="grid grid-cols-[20px_1fr] gap-3 py-2.5">
            <Icon
              size={20}
              aria-hidden
              className={cn("mt-px", kind === "included" ? "text-green" : "text-muted")}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold leading-[1.35]">{item.title}</span>
              {item.note && <span className="type-small text-muted">{item.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
