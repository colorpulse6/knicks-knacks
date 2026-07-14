import { within } from "@testing-library/dom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "../page";
import { examples } from "../data/examples";
import { homepageJsonLd } from "../lib/seo";
import { siteConfig } from "../lib/site";

function renderServerHome() {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<Home />);
  return container;
}

describe("permanent homepage content", () => {
  it("renders one semantic page heading inside the complete document structure", () => {
    const container = renderServerHome();

    expect(
      within(container).getAllByRole("heading", { level: 1 }),
    ).toHaveLength(1);
    expect(container.querySelector("header nav")).not.toBeNull();
    expect(container.querySelector("main")).not.toBeNull();
    expect(container.querySelectorAll("main section").length).toBeGreaterThan(
      2,
    );
    expect(container.querySelector("footer#support")).not.toBeNull();
  });

  it("offers only the approved visible header navigation links", () => {
    const container = renderServerHome();
    const nav = container.querySelector("header nav");

    expect(nav).not.toBeNull();
    const links = within(nav as HTMLElement).getAllByRole("link");
    expect(
      links.map((link) => [
        link.textContent?.trim(),
        link.getAttribute("href"),
      ]),
    ).toEqual([
      ["Examples", "#examples"],
      ["How It Works", "#how-it-works"],
      ["Support", "#support"],
    ]);
  });

  it("states the JavaScript flavor, input convention, and honest limits", () => {
    const container = renderServerHome();
    const copy = container.textContent ?? "";

    expect(copy).toMatch(/JavaScript(?:\s|\/)+ECMAScript/i);
    expect(copy).toMatch(/browser runtime/i);
    expect(copy).toMatch(/without (?:the )?surrounding slash delimiters/i);
    expect(copy).toMatch(/validates? format, not meaning or strength/i);
  });

  it("links all five checked-in examples as ordinary server anchors", () => {
    const container = renderServerHome();
    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(
        '#examples a[href^="/examples/"]',
      ),
    );

    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      examples.map((example) => `/examples/${example.slug}`),
    );
    expect(links.every((link) => link.tagName === "A")).toBe(true);
  });

  it("keeps the four core FAQ answers in the initial server-rendered tree", () => {
    const container = renderServerHome();
    const faq = container.querySelector("#faq");

    expect(faq).toHaveTextContent("What regex flavor does Regexplain use?");
    expect(faq).toHaveTextContent("Should I include slash delimiters?");
    expect(faq).toHaveTextContent("Is my regex processed privately?");
    expect(faq).toHaveTextContent("What can regex validation tell me?");
    expect(faq).toHaveTextContent(/local.*browser/i);
    expect(faq).toHaveTextContent(/AI.*Groq/i);
    expect(faq).toHaveTextContent(/format.*not.*meaning|meaning.*not.*format/i);
  });

  it("publishes transparent methodology, source, privacy, and support links", () => {
    const container = renderServerHome();
    const footer = container.querySelector("footer#support");

    expect(footer).toHaveTextContent(
      /syntax map.*testing.*local.*deterministic/i,
    );
    expect(footer).toHaveTextContent(/AI request.*sends.*pattern.*Groq/i);

    const source = within(footer as HTMLElement).getByRole("link", {
      name: "View source",
    });
    expect(source).toHaveAttribute("href", siteConfig.sourceUrl);

    const support = within(footer as HTMLElement).getByRole("link", {
      name: "Support Regexplain",
    });
    expect(support).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/nicbarnes",
    );
    expect(support).toHaveAttribute("target", "_blank");
    expect(support).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("emits the existing homepage JSON-LD payload once", () => {
    const container = renderServerHome();
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );

    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0]?.textContent ?? "null")).toEqual(
      homepageJsonLd(),
    );
  });
});
