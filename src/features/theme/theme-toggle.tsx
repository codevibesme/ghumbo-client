"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/cn";
import { type ThemeChoice, setTheme, useTheme } from "./theme-store";

const options = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

/** Segmented System / Light / Dark switch. Mono caps like the filter chips. */
export function ThemeToggle({ tone = "default", className }: { tone?: "default" | "board"; className?: string }) {
  const theme = useTheme();
  const board = tone === "board";
  return (
    <ToggleGroup.Root
      type="single"
      value={theme}
      onValueChange={(v) => v && setTheme(v as ThemeChoice)}
      aria-label="Colour theme"
      className={cn(
        "inline-flex h-11 overflow-hidden rounded-ticket border-[1.5px]",
        board ? "border-board-dash bg-board" : "border-line bg-card",
        className,
      )}
    >
      {options.map(({ value, label, Icon }) => (
        <ToggleGroup.Item
          key={value}
          value={value}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 px-3 font-mono text-[12px] font-semibold uppercase tracking-[0.06em]",
            "focus-visible:-outline-offset-4",
            board
              ? "text-on-board not-first:border-l-[1.5px] not-first:border-board-dash data-[state=on]:bg-flap data-[state=on]:text-board"
              : "text-ink not-first:border-l-[1.5px] not-first:border-rule data-[state=on]:bg-passport data-[state=on]:text-on-passport",
          )}
        >
          <Icon size={16} aria-hidden />
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
