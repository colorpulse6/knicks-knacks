import { describe, expect, it } from "vitest";
import { SITE } from "./config/site";
import { metadata as rootMetadata } from "./layout";
import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("crawler metadata routes", () => {
  it("allows public pages while excluding API routes", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      sitemap: "https://www.botbattle.cc/sitemap.xml",
    });
  });

  it("publishes only the canonical homepage in the sitemap", () => {
    expect(sitemap()).toEqual([{ url: "https://www.botbattle.cc/" }]);
  });

  it("describes the installable BotBattle app", () => {
    expect(manifest()).toEqual({
      name: "BotBattle",
      description: SITE.description,
      start_url: "/",
      display: "standalone",
      background_color: "#faf6ee",
      theme_color: "#8a4b2f",
      icons: [
        {
          src: "/botbattle-icon.png",
          sizes: "1024x1024",
          type: "image/png",
        },
      ],
    });
  });
});

describe("root metadata", () => {
  it("contains only metadata shared by every route", () => {
    expect(rootMetadata.metadataBase).toEqual(
      new URL("https://www.botbattle.cc"),
    );
    expect(rootMetadata.applicationName).toBe("BotBattle");
    expect(rootMetadata.title).toEqual({
      default: "BotBattle",
      template: "%s | BotBattle",
    });
    expect(rootMetadata.icons).toEqual({
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        {
          url: "/botbattle-icon.png",
          sizes: "1024x1024",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/botbattle-icon.png",
          sizes: "1024x1024",
          type: "image/png",
        },
      ],
    });
    expect(rootMetadata.manifest).toBe("/manifest.webmanifest");

    expect(rootMetadata).not.toHaveProperty("alternates");
    expect(rootMetadata).not.toHaveProperty("description");
    expect(rootMetadata).not.toHaveProperty("openGraph");
    expect(rootMetadata).not.toHaveProperty("twitter");
    expect(rootMetadata).not.toHaveProperty("verification");
  });
});
