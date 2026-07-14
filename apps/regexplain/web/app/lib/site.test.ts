import { describe, expect, it } from "vitest";

import { absoluteUrl, siteConfig } from "./site";

describe("siteConfig", () => {
  it("uses the canonical production origin", () => {
    expect(siteConfig.url).toBe("https://www.regexplain.cc");
    expect(absoluteUrl("/examples/email-regex")).toBe(
      "https://www.regexplain.cc/examples/email-regex",
    );
  });

  it("defines the public product identity", () => {
    expect(siteConfig).toMatchObject({
      name: "Regexplain",
      title: "Regexplain — Regex Explainer & Tester",
      description:
        "Explain, test, and learn regular expressions with clear breakdowns and practical examples.",
      creator: "Nic Barnes",
      publisher: "Regexplain",
      sourceUrl:
        "https://github.com/colorpulse6/knicks-knacks/tree/main/apps/regexplain/web",
      supportUrl: "https://buymeacoffee.com/nicbarnes",
    });
    expect(Object.isFrozen(siteConfig)).toBe(true);
  });
});
