"use client";

import { useState } from "react";
import { Chip, RemovableChip } from "@/components/ui/chip";
import { textLinkClasses } from "@/components/ui/variants";
import { cn } from "@/lib/cn";

export function ChipsDemo() {
  const [active, setActive] = useState<string[]>(["Wildlife"]);
  const [month, setMonth] = useState<string | null>("July");
  const toggle = (c: string) => setActive((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {["Mountains", "Wildlife", "Beaches", "Heritage"].map((c) => (
        <Chip key={c} active={active.includes(c)} onClick={() => toggle(c)}>
          {c}
        </Chip>
      ))}
      {month && <RemovableChip label={`Month: ${month}`} onClick={() => setMonth(null)} />}
      <button
        type="button"
        onClick={() => {
          setActive([]);
          setMonth(null);
        }}
        className={cn(textLinkClasses(), "cursor-pointer")}
      >
        Clear all
      </button>
    </div>
  );
}
