import { Check } from "lucide-react";
import { STATUS, STEPS, formatStamp } from "@/features/account/lib";
import { cn } from "@/lib/cn";
import type { UserBookingRequest } from "../types";

/*
 * T13 "Where it stands". The backend keeps when the request was sent and when
 * its status last changed, so the first step and the current step carry a
 * time; steps in between are ticked without one and later steps read
 * "Pending". Closed and withdrawn requests show a single row.
 */
export function StatusTimeline({ request: r }: { request: UserBookingRequest }) {
  const current = STEPS.findIndex((s) => s.status === r.status);

  return (
    <section
      aria-labelledby="where-h"
      className="flex flex-col gap-5 rounded-ticket border-[1.5px] border-line bg-card px-5 pt-6 pb-2 md:px-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="where-h" className="m-0 type-h3">
          Where it stands
        </h2>
        {current >= 0 && (
          <span className="type-stub text-muted">
            Step {current + 1} of {STEPS.length}
          </span>
        )}
      </div>

      {current < 0 ? (
        <div className="flex gap-4 pb-6">
          <span aria-hidden className="size-7 shrink-0 rounded-full border-[2.5px] border-tear bg-rule" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="m-0 type-h4">{STATUS[r.status].label}</h3>
              <span className="font-mono text-[14px] font-semibold leading-none tracking-[0.02em]">
                {formatStamp(r.updatedAt)}
              </span>
            </div>
            <p className="m-0 type-small">
              {r.status === "withdrawn"
                ? "You withdrew this request. Nothing was paid, so nothing is charged."
                : "This request is closed. We’re no longer holding seats for it."}
            </p>
          </div>
        </div>
      ) : (
        <ol className="m-0 list-none p-0">
          {STEPS.map((step, i) => {
            const done = i < current;
            const now = i === current;
            const last = i === STEPS.length - 1;
            return (
              <li key={step.status} className="flex gap-4" aria-current={now ? "step" : undefined}>
                <span aria-hidden className="flex w-7 shrink-0 flex-col items-center">
                  {done || (now && step.status === "converted") ? (
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-passport text-on-passport">
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  ) : now ? (
                    <span className="inline-flex size-7 items-center justify-center rounded-full border-[2.5px] border-amber bg-card">
                      <span className="size-3 rounded-full bg-seat-amber" />
                    </span>
                  ) : (
                    <span className="size-7 rounded-full border-2 border-dashed border-tear" />
                  )}
                  {!last && (
                    <span
                      className={cn(
                        "min-h-4 w-0 flex-1 border-l-2",
                        done ? "border-solid border-passport" : "border-dashed border-tear",
                      )}
                    />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5 pb-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <h3 className={cn("m-0 type-h4", !done && !now && "text-muted")}>{STATUS[step.status].label}</h3>
                    {now ? (
                      <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.04em] text-amber">
                        NOW · SINCE {formatStamp(r.updatedAt)}
                      </span>
                    ) : done ? (
                      i === 0 && (
                        <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.04em] text-muted">
                          {formatStamp(r.createdAt)}
                        </span>
                      )
                    ) : (
                      <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.04em] text-muted">
                        PENDING
                      </span>
                    )}
                  </div>
                  <p className={cn("m-0 type-small", done || now ? "text-ink" : "text-muted")}>{step.body(r)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
