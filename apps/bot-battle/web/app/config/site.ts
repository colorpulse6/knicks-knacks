export const SITE = {
  name: "BotBattle",
  url: "https://www.botbattle.cc",
  homeTitle: "Compare AI Models Side by Side | BotBattle",
  pageTitle: "Compare AI Models Side by Side",
  description:
    "Compare responses from leading AI models side by side, then review latency, token usage, throughput, and comparative analysis in one benchmark.",
  supportUrl: "https://buymeacoffee.com/nicbarnes",
  creator: "Nic Barnes",
  creatorLegalName: "Nichalas Barnes",
  creatorUrl: "https://nichalasbarnes.com/",
  // The canonical entity identifier, reused by every site this person builds,
  // so engines resolve one author instead of one per domain.
  creatorId: "https://nichalasbarnes.com/#person",
  socialImage: {
    url: "/social-card",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "BotBattle - compare AI models side by side",
  },
} as const;

export const SITE_URL = new URL(SITE.url);
