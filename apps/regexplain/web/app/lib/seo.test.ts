import { describe, expect, it } from "vitest";

import { buildRootMetadata, createPageMetadata, homepageJsonLd } from "./seo";
import { siteConfig } from "./site";

describe("buildRootMetadata", () => {
  it("builds complete canonical and social metadata for the homepage", () => {
    const metadata = buildRootMetadata({});

    expect(metadata).toMatchObject({
      metadataBase: new URL(siteConfig.url),
      title: siteConfig.title,
      description: siteConfig.description,
      applicationName: siteConfig.name,
      alternates: { canonical: "/" },
      openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: siteConfig.name,
        title: siteConfig.title,
        description: siteConfig.description,
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: siteConfig.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
        images: ["/opengraph-image"],
      },
    });
  });

  it("includes nonblank Google and Bing verification values", () => {
    expect(
      buildRootMetadata({
        GOOGLE_SITE_VERIFICATION: " google-token ",
        BING_SITE_VERIFICATION: " bing-token ",
      }).verification,
    ).toEqual({
      google: "google-token",
      other: { "msvalidate.01": "bing-token" },
    });
  });

  it("omits verification metadata when values are absent or blank", () => {
    expect(buildRootMetadata({}).verification).toBeUndefined();
    expect(
      buildRootMetadata({
        GOOGLE_SITE_VERIFICATION: "  ",
        BING_SITE_VERIFICATION: "\t",
      }).verification,
    ).toBeUndefined();
  });
});

describe("createPageMetadata", () => {
  it("builds reusable canonical and social metadata without changing root defaults", () => {
    const metadata = createPageMetadata({
      title: "Practical email address regex explained | Regexplain",
      description: "A practical, example-specific email regex description.",
      path: "/examples/email-regex",
    });

    expect(metadata).toMatchObject({
      metadataBase: new URL(siteConfig.url),
      title: "Practical email address regex explained | Regexplain",
      description: "A practical, example-specific email regex description.",
      alternates: {
        canonical: "https://www.regexplain.cc/examples/email-regex",
      },
      openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://www.regexplain.cc/examples/email-regex",
        siteName: siteConfig.name,
        title: "Practical email address regex explained | Regexplain",
        description: "A practical, example-specific email regex description.",
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: "Practical email address regex explained | Regexplain",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Practical email address regex explained | Regexplain",
        description: "A practical, example-specific email regex description.",
        images: ["/opengraph-image"],
      },
    });

    expect(buildRootMetadata({}).alternates).toEqual({ canonical: "/" });
  });
});

describe("homepageJsonLd", () => {
  it("describes the website and free browser application truthfully", () => {
    const schema = homepageJsonLd();
    const graph = schema["@graph"];

    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description,
        }),
        expect.objectContaining({
          "@type": "WebApplication",
          name: siteConfig.name,
          url: siteConfig.url,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      ]),
    );

    expect(JSON.stringify(schema)).not.toMatch(
      /"(?:review|rating|aggregateRating)"/i,
    );
  });
});
