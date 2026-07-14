import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeExplainer, HomeIntro } from "./components/HomeSeoContent";
import { SITE } from "./config/site";
import { serializeJsonLd, WEB_APPLICATION_JSON_LD } from "./structured-data";

describe("homepage structured data", () => {
  it("describes BotBattle as a free web application using visible claims", () => {
    expect(WEB_APPLICATION_JSON_LD).toEqual({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE.name,
      url: `${SITE.url}/`,
      description: SITE.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Side-by-side LLM response comparison",
        "Latency, token usage, and throughput metrics",
        "Comparative response analysis",
      ],
    });
    expect(WEB_APPLICATION_JSON_LD).not.toHaveProperty("review");
    expect(WEB_APPLICATION_JSON_LD).not.toHaveProperty("aggregateRating");

    const visibleContent = renderToStaticMarkup(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(HomeIntro),
        React.createElement(HomeExplainer),
      ),
    ).toLowerCase();
    const visibleEvidence = {
      "Side-by-side LLM response comparison": ["side-by-side", "responses"],
      "Latency, token usage, and throughput metrics": [
        "latency",
        "token usage",
        "throughput",
      ],
      "Comparative response analysis": ["comparative analysis", "responses"],
    } as const;

    for (const feature of WEB_APPLICATION_JSON_LD.featureList) {
      for (const phrase of visibleEvidence[feature]) {
        expect(visibleContent).toContain(phrase);
      }
    }
  });

  it("escapes script-closing input before embedding JSON-LD", () => {
    const serialized = serializeJsonLd({ value: "</script>" });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
  });
});
