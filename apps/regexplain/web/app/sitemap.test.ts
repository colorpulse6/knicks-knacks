import { describe, expect, it } from "vitest";

import { examples } from "./data/examples";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("contains only the homepage and checked-in example pages", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      "https://www.regexplain.cc/",
      ...examples.map(
        ({ slug }) => `https://www.regexplain.cc/examples/${slug}`,
      ),
    ]);
    expect(entries).toHaveLength(6);
    expect(
      urls.every((url) => !url.includes("/api/") && !url.includes("?")),
    ).toBe(true);
  });
});
