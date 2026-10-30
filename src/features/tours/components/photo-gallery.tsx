"use client";

import { LayoutGrid, X } from "lucide-react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/variants";
import type { Asset } from "@/features/destinations/types";
import { cn } from "@/lib/cn";

const frame = "relative m-0 overflow-hidden rounded-ticket border-[1.5px] border-line";

/**
 * Trip gallery: hero + up to four 4:3 tiles. With more than five photos the
 * last tile becomes "+N · View all N photos"; phones get a full-width button
 * instead. Both open one dialog with every photo and its caption.
 */
export function PhotoGallery({ photos, alt }: { photos: Asset[]; alt: string }) {
  const [open, setOpen] = useState(false);
  if (photos.length === 0) return null;
  const [hero, ...rest] = photos;
  const overflow = photos.length > 5;
  const thumbs = rest.slice(0, overflow ? 3 : 4);
  const viewAll = `View all ${photos.length} photos`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-[652fr_234fr_234fr] md:gap-4">
          <figure className={cn(frame, "col-span-3 aspect-[4/3] md:col-span-1 md:row-span-2 md:aspect-auto")}>
            <Image
              src={hero.url}
              alt={hero.label ?? alt}
              fill
              priority
              sizes="(min-width: 720px) 652px, 100vw"
              className="object-cover"
            />
          </figure>
          {thumbs.map((p, i) => (
            <figure key={p.url} className={cn(frame, "aspect-[4/3]", i === 3 && "hidden md:block")}>
              <Image src={p.url} alt={p.label ?? alt} fill sizes="(min-width: 720px) 234px, 33vw" className="object-cover" />
            </figure>
          ))}
          {overflow && (
            <Dialog.Trigger className="on-board hidden aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-ticket border-[1.5px] border-board bg-board p-4 text-on-board md:flex">
              <span aria-hidden className="text-[36px] font-extrabold leading-none text-flap [font-stretch:115%]">
                +{photos.length - 4}
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.06em]">
                <LayoutGrid size={16} aria-hidden />
                {viewAll}
              </span>
            </Dialog.Trigger>
          )}
        </div>
        {photos.length > 1 && (
          <Dialog.Trigger className={buttonClasses({ variant: "secondary", size: "m", fullWidth: true, className: "md:hidden" })}>
            <LayoutGrid size={20} aria-hidden />
            {viewAll}
          </Dialog.Trigger>
        )}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-board/80" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-stock text-ink md:inset-8 md:rounded-ticket md:border-[1.5px] md:border-line"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-dashed border-tear bg-stock px-4 py-3 md:px-6">
            <Dialog.Title className="m-0 type-h4">{viewAll.replace("View all ", "All ")}</Dialog.Title>
            <Dialog.Close
              className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-ticket border-[1.5px] border-line bg-card text-ink"
              aria-label="Close photos"
            >
              <X size={20} aria-hidden />
            </Dialog.Close>
          </div>
          <ul className="m-0 grid list-none gap-6 p-4 md:grid-cols-2 md:p-6">
            {photos.map((p) => (
              <li key={p.url} className="flex flex-col gap-2">
                <span className={cn(frame, "block aspect-[4/3]")}>
                  <Image src={p.url} alt={p.label ?? alt} fill sizes="(min-width: 720px) 50vw, 100vw" className="object-cover" />
                </span>
                {(p.label || p.description) && (
                  <span className="type-small text-muted">{p.description ?? p.label}</span>
                )}
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
