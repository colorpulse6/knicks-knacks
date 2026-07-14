import { describe, expect, it } from "vitest";

import { socialImage } from "./social-image";

describe("socialImage", () => {
  it("defines deterministic text and dimensions for the terminal card", () => {
    expect(socialImage).toMatchObject({
      brand: "Regexplain",
      proposition: "Regex explainer & tester",
      examplePattern: "/^[a-z]+$/i",
      size: { width: 1200, height: 630 },
    });
    expect(socialImage.examplePattern).toMatch(/[.*+?^${}()|[\]\\]/);
  });

  it("uses a local text-only model with no remote asset URL", () => {
    expect(JSON.stringify(socialImage)).not.toMatch(/https?:\/\//i);
    expect(socialImage).not.toHaveProperty("assetUrl");
  });
});
