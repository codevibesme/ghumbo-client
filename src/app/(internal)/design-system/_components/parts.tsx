import type { ReactNode } from "react";
import { Kicker } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";

export function Section({ id, kicker, title, note, children }: { id: string; kicker: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-6 flex-col gap-6 border-t-[1.5px] border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Kicker>{kicker}</Kicker>
          <h2 id={`${id}-h`} className="m-0 type-h2">
            {title}
          </h2>
        </div>
        {note && <p className="m-0 max-w-[60ch] type-small text-muted md:text-right">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export function Spec({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <span className="font-mono text-[11px] font-medium uppercase leading-[1.3] tracking-[0.08em] text-muted">{label}</span>
      {children}
    </div>
  );
}
