import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { siteLd } from "@/config/seo";
import { ThemeScript } from "@/features/theme/theme-script";

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
    default: "Ghumbo · Budget group trips across India",
    template: "%s · Ghumbo",
  },
  description:
    "Fixed-departure group trips for 20–35 year-olds. Pick a date, request a seat, we call you within 24 hours. First stop: West Bengal.",
  applicationName: "Ghumbo",
  openGraph: { type: "website", siteName: "Ghumbo", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#121821" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={siteLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
