"use client";

import { useEffect } from "react";

// Last resort when the root layout itself fails. It replaces the whole
// document, so it can't rely on globals.css, fonts or the theme script.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-IN">
      <head>
        <title>Something went wrong · Ghumbo</title>
        <meta name="robots" content="noindex" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "Canvas",
          color: "CanvasText",
        }}
      >
        <main style={{ maxWidth: 480, padding: 24 }}>
          <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2362b" }}>
            Ghumbo · error
          </p>
          <h1 style={{ margin: "12px 0", fontSize: 32, lineHeight: 1.15 }}>Something went wrong.</h1>
          <p style={{ margin: "0 0 20px", lineHeight: 1.5 }}>Try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              font: "inherit",
              padding: "12px 20px",
              borderRadius: 8,
              border: 0,
              background: "#1f3a5f",
              color: "#f2f4ec",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && <p style={{ marginTop: 20, fontSize: 13, opacity: 0.7 }}>Reference {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
