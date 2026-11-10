import "server-only";

/*
 * Archivo for next/og share cards. ImageResponse can't read the site's
 * next/font files or variable axes, and takes TTF/OTF/WOFF but not WOFF2, so
 * fetch static instances from Google Fonts with a legacy user agent (which
 * gets WOFF). Runs at build time; the cards are static.
 */
const LEGACY_UA = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Safari/534.30";

async function googleFont(family: string, text?: string) {
  const query = `family=${family}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?${query}`, { headers: { "user-agent": LEGACY_UA } })
  ).text();
  // Google splits a family into per-script subsets; take "latin", or the only one for a text= subset.
  const block = css.split("/* latin */")[1] ?? css;
  const url = /src: url\((.+?)\) format\('(?:woff|truetype|opentype)'\)/.exec(block)?.[1];
  if (!url) throw new Error(`No font file for ${family}`);
  return (await fetch(url)).arrayBuffer();
}

/**
 * Display: ExtraBold at 125% width (the site's headings). Body: Medium.
 * Archivo has no ₹: use fontFamily "Archivo, Rupee" where prices appear
 * (a one-glyph Noto Sans subset).
 * Every text node must set the matching fontWeight, or the renderer falls back.
 */
export async function ogFonts() {
  const [display, body, rupee] = await Promise.all([
    googleFont("Archivo:wdth,wght@125,800"),
    googleFont("Archivo:wght@500"),
    googleFont("Noto+Sans:wght@500", "₹"),
  ]);
  return [
    { name: "Archivo Display", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Archivo", data: body, weight: 500 as const, style: "normal" as const },
    { name: "Rupee", data: rupee, weight: 500 as const, style: "normal" as const },
  ];
}
