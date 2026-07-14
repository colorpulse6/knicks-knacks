import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeExplainer, HomeIntro } from "./HomeSeoContent";

function renderHomeSeoContent() {
  return renderToStaticMarkup(
    <>
      <HomeIntro />
      <HomeExplainer />
    </>,
  );
}

function visibleText(markup: string) {
  const container = document.createElement("div");
  container.innerHTML = markup;
  return container.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

describe("homepage SEO content", () => {
  it("renders one descriptive heading and the benchmark's visible capabilities", () => {
    const markup = renderHomeSeoContent();
    const container = document.createElement("div");
    container.innerHTML = markup;
    const text = visibleText(markup);

    const headings = container.querySelectorAll("h1");
    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe("Compare AI models side by side");

    expect(text).toMatch(/one prompt/i);
    expect(text).toMatch(/side-by-side (?:responses|answers)/i);
    expect(text).toMatch(/latency/i);
    expect(text).toMatch(/token usage/i);
    expect(text).toMatch(/throughput/i);
    expect(text).toMatch(/shared free-tier access/i);
    expect(text).toMatch(/own provider keys/i);
    expect(text).toMatch(/comparative analysis/i);
  });

  it("links to settings in ordinary rendered content", () => {
    const markup = renderHomeSeoContent();
    const container = document.createElement("div");
    container.innerHTML = markup;

    expect(container.querySelector('a[href="/settings"]')).not.toBeNull();
  });
});
