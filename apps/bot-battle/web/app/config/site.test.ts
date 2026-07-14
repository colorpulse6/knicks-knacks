import { describe, expect, it } from "vitest";
import { SITE, SITE_URL } from "./site";

describe("SITE", () => {
  it("uses the canonical BotBattle origin", () => {
    expect(SITE.url).toBe("https://www.botbattle.cc");
    expect(SITE_URL).toEqual(new URL(SITE.url));
  });

  it("describes the canonical social image", () => {
    const socialImageUrl = new URL(SITE.socialImage.url, SITE_URL);

    expect(socialImageUrl.origin).toBe(SITE_URL.origin);
    expect(SITE.socialImage).toEqual({
      url: "/social-card",
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "BotBattle - compare AI models side by side",
    });
  });
});
