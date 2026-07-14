import type { MetadataRoute } from "next";

import { examples } from "./data/examples";
import { absoluteUrl } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...examples.map(({ slug }) => ({
      url: absoluteUrl(`/examples/${slug}`),
    })),
  ];
}
