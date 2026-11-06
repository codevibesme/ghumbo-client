"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

/**
 * Phone sort on /trips: a native select beside the Filters button, as on the
 * canvas. Each option is the same URL the desktop sort chips link to, so the
 * page stays server-rendered; without JavaScript the chips show instead.
 */
export function SortSelect({ options }: { options: { label: string; href: string; selected: boolean }[] }) {
  const router = useRouter();
  const current = options.find((o) => o.selected)?.href ?? options[0]?.href;
  return (
    <Select
      aria-label="Sort trips"
      value={current}
      onChange={(e) => router.push(e.currentTarget.value, { scroll: false })}
    >
      {options.map((o) => (
        <option key={o.href} value={o.href}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
