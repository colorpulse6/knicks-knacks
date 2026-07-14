import type { MetadataRoute } from "next";

import { terminalPalette } from "./lib/social-image";
import { absoluteUrl, siteConfig } from "./lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    id: absoluteUrl("/"),
    start_url: absoluteUrl("/"),
    display: "standalone",
    theme_color: terminalPalette.surface,
    background_color: terminalPalette.background,
  };
}
