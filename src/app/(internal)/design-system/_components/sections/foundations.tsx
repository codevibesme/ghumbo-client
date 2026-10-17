import { Logo, LogoMark } from "@/components/layout/logo";
import { TearLine } from "@/components/ui/tear-line";
import { Section, Spec } from "../parts";
import { colourTokens } from "../sample-data";
import { typeScale } from "../specimens";

export function FoundationsSections() {
  return (
    <>
<Section id="foundations" kicker="00 · Foundations" title="Colour, type, shape" note="Utilities read CSS variables, so every token flips with the theme. Hex pairs are light / dark.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {colourTokens.map((c) => (
              <div key={c.token} className="ticket-surface flex flex-col overflow-hidden">
                <div className="h-14 border-b-[1.5px] border-line" style={{ background: `var(--g-${c.token})` }} />
                <div className="flex flex-col gap-1 px-3 py-2.5">
                  <span className="text-[14px] font-semibold">{c.name}</span>
                  <span className="font-mono text-[11px] font-medium leading-[1.3] text-muted">
                    {c.token} · {c.light} / {c.dark}
                  </span>
                  <span className="font-mono text-[11px] leading-[1.3] text-muted">{c.use}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ticket-surface divide-y-[1.5px] divide-rule">
            {typeScale.map((t) => (
              <div key={t.name} className="grid gap-2 px-5 py-4 md:grid-cols-[110px_260px_minmax(0,1fr)] md:items-baseline md:gap-6">
                <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-red">{t.name}</span>
                <span className="font-mono text-[12px] text-muted">{t.spec}</span>
                <span className={`${t.cls} min-w-0 break-words`}>{t.sample}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Spec label="Spacing · 4-based">
              <div className="flex flex-wrap items-end gap-2">
                {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map((s) => (
                  <span key={s} className="flex flex-col items-center gap-1">
                    <span className="block w-3 bg-passport" style={{ height: s }} />
                    <span className="font-mono text-[10px] text-muted">{s}</span>
                  </span>
                ))}
              </div>
            </Spec>
            <Spec label="Radii · rounded-ticket 6 · rounded-chip 4">
              <div className="flex gap-3">
                <span className="ticket-surface flex h-14 w-20 items-center justify-center font-mono text-[11px]">6</span>
                <span className="flex h-14 w-20 items-center justify-center rounded-chip border-[1.5px] border-line bg-card font-mono text-[11px]">4</span>
                <span className="flex size-14 items-center justify-center rounded-full bg-passport font-mono text-[11px] text-on-passport">RS</span>
              </div>
            </Spec>
            <Spec label="Tear line + notches (on a card)">
              <div className="ticket-surface">
                <div className="px-5 py-4 type-small">Card body</div>
                <TearLine />
                <div className="px-5 py-4 type-small text-muted">Stub</div>
              </div>
            </Spec>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Spec label="Logo · ink on stock · stock on board">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ticket-surface flex items-center justify-center p-8">
                  <Logo className="w-56" ground="var(--g-card)" />
                </div>
                <div className="flex items-center justify-center rounded-ticket bg-board p-8">
                  <Logo tone="stock" className="w-56" />
                </div>
              </div>
            </Spec>
            <Spec label="Mark">
              <div className="flex items-end gap-4">
                <span className="flex size-24 items-center justify-center rounded-[22px] bg-passport">
                  <LogoMark tone="stock" />
                </span>
                <span className="flex size-16 items-center justify-center rounded-[15px] border-[1.5px] border-line bg-stock">
                  <LogoMark className="w-[30px]" />
                </span>
              </div>
            </Spec>
          </div>
        </Section>
    </>
  );
}
