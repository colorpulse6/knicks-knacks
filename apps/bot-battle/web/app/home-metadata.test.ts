import { describe, expect, it } from "vitest";
import { SITE } from "./config/site";
import { metadata } from "./page";

describe("homepage metadata", () => {
  it("owns complete canonical and social metadata for the benchmark route", () => {
    expect(metadata.title).toBe(SITE.pageTitle);
    expect(metadata.description).toBe(SITE.description);
    expect(metadata.alternates).toEqual({ canonical: "/" });
    expect(metadata.openGraph).toEqual({
      title: SITE.homeTitle,
      description: SITE.description,
      url: "/",
      siteName: SITE.name,
      type: "website",
      images: [SITE.socialImage],
    });
    expect(metadata.twitter).toEqual({
      card: "summary_large_image",
      title: SITE.homeTitle,
      description: SITE.description,
      images: [SITE.socialImage],
    });
  });
});
