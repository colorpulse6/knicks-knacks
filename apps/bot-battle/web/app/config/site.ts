export const SITE = {
  name: "BotBattle",
  url: "https://www.botbattle.cc",
  homeTitle: "Compare AI Models Side by Side | BotBattle",
  pageTitle: "Compare AI Models Side by Side",
  description:
    "Compare responses from leading AI models side by side, then review latency, token usage, throughput, and comparative analysis in one benchmark.",
  supportUrl: "https://buymeacoffee.com/nicbarnes",
  socialImage: {
    url: "/social-card",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "BotBattle - compare AI models side by side",
  },
} as const;

export const SITE_URL = new URL(SITE.url);
