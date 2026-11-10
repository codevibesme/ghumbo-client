import { ImageResponse } from "next/og";

/*
 * Default share card for every page without its own image (trip and
 * destination pages use their cover photo). Ticket style: stock ground, navy
 * ink, stamp-red kicker, dashed tear line.
 */
export const alt = "Ghumbo: budget group trips across India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f2f4ec",
        color: "#1a2230",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#c2362b", fontWeight: 700 }}>
        FIXED-DATE GROUP TRIPS · INDIA
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800, letterSpacing: -3, color: "#1f3a5f" }}>ghumbo</div>
        <div style={{ display: "flex", fontSize: 44, lineHeight: 1.25, maxWidth: 900 }}>
          Pick a date, request a seat, we call you within 24 hours. Just show up.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", borderTop: "4px dashed #b9c0ae" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#4b5563" }}>
          <span>West Bengal · Andaman Islands</span>
          <span>ghumbo.com</span>
        </div>
      </div>
    </div>,
    size,
  );
}
