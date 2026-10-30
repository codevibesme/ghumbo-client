import Image from "next/image";
import { TearLine } from "@/components/ui/tear-line";

export type AuthPhoto = { src: string; alt: string };

const STUBS = [
  ["Requests", "Tracked live"],
  ["Call-back", "Within 24 hours"],
  ["Payment", "By secure link"],
] as const;

/** Right half of the sign-in split (960px and up): a photo ticket on the passport-navy panel. */
export function AuthArt({ photo, place, region }: { photo: AuthPhoto | null; place: string; region: string }) {
  return (
    <div className="hidden items-center justify-center bg-passport p-12 min-[960px]:flex">
      <figure className="m-0 w-full max-w-[520px] ticket-surface text-ink">
        <div className="px-3 pt-3">
          <div className="relative aspect-[4/5] max-h-[520px] w-full overflow-hidden rounded-[4px] bg-sunk">
            {photo && (
              <Image src={photo.src} alt={photo.alt} fill sizes="496px" loading="eager" className="object-cover" />
            )}
          </div>
        </div>
        <figcaption className="flex justify-between gap-3 px-4 pb-4 pt-3 type-label leading-[1.3]">
          <span>{place}</span>
          <span>{region}</span>
        </figcaption>
        <TearLine ground="var(--g-passport)" />
        <dl className="m-0 grid grid-cols-3 gap-4 px-5 pb-5 pt-4">
          {STUBS.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1.5">
              <dt className="type-stub text-muted">{label}</dt>
              <dd className="m-0 text-[15px] font-semibold leading-[1.3]">{value}</dd>
            </div>
          ))}
        </dl>
      </figure>
    </div>
  );
}

/** Below 960px the panel folds into a short photo strip above the form. */
export function AuthPhotoStrip({ photo }: { photo: AuthPhoto | null }) {
  if (!photo) return null;
  return (
    <div className="mb-6 ticket-surface p-2 min-[960px]:hidden">
      <div className="relative h-20 w-full overflow-hidden rounded-[4px] bg-sunk">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 720px) 424px, 100vw" className="object-cover" />
      </div>
    </div>
  );
}
