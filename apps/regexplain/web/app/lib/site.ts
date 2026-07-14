export const siteConfig = Object.freeze({
  url: "https://www.regexplain.cc",
  name: "Regexplain",
  title: "Regexplain — Regex Explainer & Tester",
  description:
    "Explain, test, and learn regular expressions with clear breakdowns and practical examples.",
  creator: "Nic Barnes",
  publisher: "Regexplain",
  sourceUrl:
    "https://github.com/colorpulse6/knicks-knacks/tree/main/apps/regexplain/web",
  supportUrl: "https://buymeacoffee.com/nicbarnes",
} as const);

export function absoluteUrl(path: string) {
  return `${siteConfig.url}/${path.replace(/^\/+/, "")}`;
}
