import { ImageResponse } from "next/og";
import { getAllTrips } from "@/features/tours/api";
import { isListable } from "@/features/tours/mappers";
import { formatINR, formatTicketDate } from "@/lib/format";
import { ogFonts } from "@/lib/og-fonts";

/*
 * Default share card (home, listings, legal pages). It mirrors the home hero:
 * the route-loop logo, the "Group trips across India" headline in Archivo
 * ExtraBold, and the featured trip's photo on a ticket. Trip and destination
 * pages share their own cover photo instead.
 */
export const alt = "Ghumbo: group trips across India, on fixed dates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  stock: "#f2f4ec",
  card: "#ffffff",
  ink: "#1a2230",
  muted: "#4b5563",
  red: "#c2362b",
  tear: "#b9c0ae",
};

/** The logo's mark (bowl, stem, dotted route, pin); "humbo" is set as text beside it. */
function Mark() {
  return (
    <svg width="58" height="81" viewBox="0 0 100 140">
      <circle cx="46" cy="46" r="24" fill="none" stroke={C.ink} strokeWidth="14" />
      <path d="M70 26 V80" stroke={C.ink} strokeWidth="14" strokeLinecap="round" />
      <path
        d="M70 80 C70 112 42 120 28 106 C16 93 30 78 44 87 C56 95 52 112 38 122"
        fill="none"
        stroke={C.ink}
        strokeWidth="7"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <circle cx="36" cy="124" r="11" fill={C.red} />
    </svg>
  );
}

export default async function OpengraphImage() {
  const [fonts, trips] = await Promise.all([ogFonts(), getAllTrips()]);
  const listable = trips.filter(isListable);
  const hero = listable.find((t) => t.isRecommended) ?? listable[0];
  const priceFrom = listable.length ? Math.min(...listable.map((t) => t.startingPrice.amount)) : null;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: C.stock, color: C.ink, padding: 64, gap: 48 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <Mark />
          <span style={{ fontFamily: "Archivo Display", fontWeight: 800, fontSize: 52, letterSpacing: -1.5, lineHeight: 1, marginTop: 8 }}>
            humbo
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Archivo, Rupee", fontWeight: 500, fontSize: 24, letterSpacing: 2, color: C.red, textTransform: "uppercase" }}>
            {`Just show up${priceFrom !== null ? ` · from ${formatINR(priceFrom)}` : ""}`}
          </span>
          <span
            style={{ fontFamily: "Archivo Display", fontWeight: 800, fontSize: 74, lineHeight: 0.98, letterSpacing: -2.5, marginTop: 14 }}
          >
            Group trips across India,
          </span>
          <span style={{ fontFamily: "Archivo Display", fontWeight: 800, fontSize: 42, letterSpacing: -1, marginTop: 14 }}>on fixed dates.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", borderTop: `3px dashed ${C.tear}` }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Archivo", fontWeight: 500, fontSize: 22, color: C.muted }}>
            <span>Groups of up to 18 · a call within 24 hours</span>
            <span>ghumbo.com</span>
          </div>
        </div>
      </div>

      {hero && (
        <div
          style={{
            width: 380,
            display: "flex",
            flexDirection: "column",
            background: C.card,
            border: `2px solid ${C.ink}`,
            borderRadius: 10,
            padding: 12,
          }}
        >
          {/* biome-ignore lint: next/og renders plain <img>; next/image doesn't apply here. */}
          <img
            src={hero.asset.url}
            alt=""
            width={352}
            height={436}
            style={{ width: 352, height: 436, objectFit: "cover", borderRadius: 4 }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 12,
              fontFamily: "Archivo", fontWeight: 500,
              fontSize: 19,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <span style={{ maxWidth: 220, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {hero.destination?.name ?? hero.name}
            </span>
            <span>{formatTicketDate(hero.nextDeparture.startDate)}</span>
          </div>
        </div>
      )}
    </div>,
    { ...size, fonts },
  );
}
