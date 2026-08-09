export const siteConfig = Object.freeze({
  url: "https://www.regexplain.cc",
  name: "Regexplain",
  title: "Regexplain — Regex Explainer & Tester",
  description:
    "Explain, test, and learn regular expressions with clear breakdowns and practical examples.",
  creator: "Nic Barnes",
  creatorLegalName: "Nichalas Barnes",
  creatorUrl: "https://nichalasbarnes.com/",
  // The canonical entity identifier, shared by every site this person builds,
  // so engines resolve one author rather than one per domain.
  creatorId: "https://nichalasbarnes.com/#person",
  publisher: "Regexplain",
  sourceUrl:
    "https://github.com/colorpulse6/knicks-knacks/tree/main/apps/regexplain/web",
  supportUrl: "https://buymeacoffee.com/nicbarnes",
} as const);

export function absoluteUrl(path: string) {
  return `${siteConfig.url}/${path.replace(/^\/+/, "")}`;
}
