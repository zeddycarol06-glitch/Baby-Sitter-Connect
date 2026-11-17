"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "28rem" }}>
          <div
            aria-hidden="true"
            style={{
              width: "3rem",
              height: "3rem",
              margin: "0 auto 1.25rem",
              borderRadius: "999px",
              background: "#fee2e2",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: "1.6rem", margin: "0 0 0.75rem" }}>BabySitter Connect hit a snag</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            The app couldn&apos;t finish loading. Reloading usually fixes it — if it keeps happening,
            please contact support.
          </p>
          {error.digest ? (
            <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0 0 1.5rem" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: "0.6rem",
              background: "#0f766e",
              color: "#ffffff",
              padding: "0.65rem 1.1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload the app
          </button>
        </main>
      </body>
    </html>
  );
}
