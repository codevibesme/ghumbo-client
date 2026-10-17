import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Dashed box, round icon, title, line of copy, one action. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3.5 rounded-ticket border-2 border-dashed border-tear px-6 py-10 text-center",
        className,
      )}
    >
      <span className="inline-flex size-14 items-center justify-center rounded-full border-[1.5px] border-line bg-card text-link">
        {icon}
      </span>
      <h3 className="m-0 type-h3">{title}</h3>
      {children && <p className="m-0 max-w-[40ch] type-body text-muted">{children}</p>}
      {action}
    </div>
  );
}
