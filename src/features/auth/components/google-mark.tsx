import Image from "next/image";

/** Google's "G" from our CDN. SVG, so it skips the image optimizer. */
export function GoogleMark({ size = 20 }: { size?: number }) {
  return <Image src="https://cdn.ghumbo.com/auth/google.svg" alt="" width={size} height={size} unoptimized />;
}
