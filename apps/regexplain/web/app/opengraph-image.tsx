import { ImageResponse } from "next/og";

import { socialImage } from "./lib/social-image";

export const alt = "Regexplain — Regex Explainer & Tester";
export const size = socialImage.size;
export const contentType = socialImage.contentType;

export default function OpenGraphImage() {
  const { brand, examplePattern, palette, prompt, proposition } = socialImage;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: palette.background,
          color: palette.text,
          display: "flex",
          fontFamily: "monospace",
          height: "100%",
          padding: "54px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: palette.surface,
            border: `2px solid ${palette.border}`,
            borderRadius: "24px",
            boxShadow: `0 0 48px ${palette.primary}18`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              borderBottom: `2px solid ${palette.border}`,
              color: palette.muted,
              display: "flex",
              fontSize: "22px",
              gap: "12px",
              height: "76px",
              padding: "0 30px",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                background: palette.primary,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                width: "12px",
                height: "12px",
                background: palette.secondary,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            <span>regexplain://terminal</span>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              padding: "42px 58px 50px",
            }}
          >
            <div
              style={{
                color: palette.primary,
                display: "flex",
                fontSize: "25px",
                letterSpacing: "0.08em",
                marginBottom: "24px",
                textTransform: "uppercase",
              }}
            >
              {prompt}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "sans-serif",
                fontSize: "76px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {brand}
            </div>
            <div
              style={{
                color: palette.secondary,
                display: "flex",
                fontSize: "30px",
                marginTop: "18px",
                textTransform: "uppercase",
              }}
            >
              {proposition}
            </div>
            <div
              style={{
                background: palette.background,
                border: `1px solid ${palette.border}`,
                borderRadius: "12px",
                color: palette.primary,
                display: "flex",
                fontSize: "34px",
                marginTop: "34px",
                padding: "18px 24px",
              }}
            >
              {examplePattern}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
