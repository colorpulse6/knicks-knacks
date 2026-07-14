import type { MetadataRoute } from "next";
import { SITE } from "./config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
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
  };
}
