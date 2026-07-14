import React from "react";

const COLORS = {
  paper: "#faf6ee",
  ink: "#2b241c",
  rust: "#8a4b2f",
} as const;

export function SocialCard() {
  return (
    <div
      style={{
        alignItems: "stretch",
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        display: "flex",
        height: "100%",
        padding: "64px 72px",
        width: "100%",
      }}
    >
      <div
        style={{
          border: `3px solid ${COLORS.ink}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-1px",
          }}
        >
          <span>BotBattle</span>
          <span style={{ color: COLORS.rust }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Compare AI models side by side
          </div>
          <div
            style={{
              color: COLORS.rust,
              display: "flex",
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 880,
            }}
          >
            Compare responses, latency, and token metrics in one benchmark.
          </div>
        </div>
      </div>
    </div>
  );
}
