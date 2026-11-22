import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { siteLd } from "@/config/seo";

import "./globals.css";

// Archivo with its width axis: display type runs at 110–125% stretch.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ghumbo.com"),
  title: {
    default: "Ghumbo · Fully planned trips across India",
    template: "%s · Ghumbo",
  },
  description:
    "Travel more. Plan less. Fully planned trips across India, on fixed dates: stays, transfers, permits and the 4 am alarm, all sorted. Pick a date, pay online, just show up.",
  applicationName: "Ghumbo",
  openGraph: { type: "website", siteName: "Ghumbo", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export const viewport: Viewport = {
  // Light only for now; the dark tokens stay in globals.css for later.
  themeColor: "#f2f4ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Always light: data-theme="light" overrides the OS preference. To bring dark mode back, drop it and render
    // ThemeScript (features/theme) in <head> again.
    <html lang="en-IN" data-theme="light" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={siteLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
