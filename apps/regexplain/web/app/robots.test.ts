import { describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots", () => {
  it("allows public pages, protects the API, and advertises the sitemap", () => {
    const policy = robots();

    expect(policy.rules).toEqual(
      expect.objectContaining({
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      }),
    );
    expect(policy.sitemap).toBe("https://www.regexplain.cc/sitemap.xml");
  });

  it.each(["Googlebot", "Bingbot", "OAI-SearchBot", "Claude-SearchBot"])(
    "does not block %s from public pages",
    (crawler) => {
      const policy = robots();
      const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
      const matchingRules = rules.filter((rule) => {
        const agents = Array.isArray(rule.userAgent)
          ? rule.userAgent
          : [rule.userAgent];
        return agents.includes("*") || agents.includes(crawler);
      });

      expect(matchingRules.length).toBeGreaterThan(0);
      expect(matchingRules.every((rule) => rule.allow === "/")).toBe(true);
      expect(
        matchingRules.some((rule) =>
          (Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]).some(
            (path) => path === "/" || path === `/${crawler}/`,
          ),
        ),
      ).toBe(false);
    },
  );
});
