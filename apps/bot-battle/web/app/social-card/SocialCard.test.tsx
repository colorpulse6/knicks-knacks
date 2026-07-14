import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SITE } from "../config/site";
import { SocialCard } from "./SocialCard";

function renderSocialCard() {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<SocialCard />);
  return container;
}

describe("SocialCard", () => {
  it("renders the BotBattle message and benchmark metrics", () => {
    const text = renderSocialCard().textContent?.replace(/\s+/g, " ").trim();

    expect(text).toMatch(/BotBattle\./);
    expect(text).toMatch(/Compare AI models side by side/);
    expect(text).toMatch(/responses/i);
    expect(text).toMatch(/latency/i);
    expect(text).toMatch(/token metrics/i);
  });

  it("uses the configured 1200 by 630 social image route", () => {
    expect(SITE.socialImage).toMatchObject({
      url: "/social-card",
      width: 1200,
      height: 630,
      type: "image/png",
    });
  });
});
