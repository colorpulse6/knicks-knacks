import { SITE } from "./config/site";

export const WEB_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: `${SITE.url}/`,
  description: SITE.description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  isAccessibleForFree: true,
  author: {
    "@type": "Person",
    "@id": SITE.creatorId,
    name: SITE.creatorLegalName,
    alternateName: SITE.creator,
    url: SITE.creatorUrl,
    sameAs: [
      "https://github.com/colorpulse6",
      "https://www.linkedin.com/in/nic-barnes-a3297217/",
    ],
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Side-by-side LLM response comparison",
    "Latency, token usage, and throughput metrics",
    "Comparative response analysis",
  ],
} as const;

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
