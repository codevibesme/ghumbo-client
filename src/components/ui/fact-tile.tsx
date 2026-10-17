import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Icon + stub label + big value + note. Tour facts: best time, hubs… */
export function FactTile({
  icon,
  label,
  value,
  note,
  className,
}: {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ticket-surface flex flex-col gap-2.5 px-5 py-[18px]", className)}>
      <span className="flex items-center gap-2 text-link">
        {icon}
        <span className="type-stub text-muted">{label}</span>
      </span>
      <span className="text-[24px] font-extrabold leading-[1.1] [font-stretch:115%]">{value}</span>
      {note && <span className="type-small text-muted">{note}</span>}
    </div>
  );
}
