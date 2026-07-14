import { describe, expect, it } from "vitest";

import manifest from "./manifest";

describe("manifest", () => {
  it("describes the installable terminal application", () => {
    expect(manifest()).toMatchObject({
      name: "Regexplain — Regex Explainer & Tester",
      short_name: "Regexplain",
      description:
        "Explain, test, and learn regular expressions with clear breakdowns and practical examples.",
      start_url: "https://www.regexplain.cc/",
      display: "standalone",
      theme_color: "#0b0f14",
      background_color: "#07090c",
    });
  });
});
